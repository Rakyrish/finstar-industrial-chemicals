from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import uuid

from services.openai_service import openai_service
from .models import ChatSession, ChatMessage
from products.models import Product


class ChatbotMessageView(APIView):
    """
    Exposes chat agent lookup API to interact with the high-purity chemical RAG engine.
    Supports persistent DB logging and matches catalog product suggestions.
    
    Accepts:
    {
      "message": "User query here...",
      "sessionId": "uuid-string-optional",
      "context": {
        "currentPage": "..."
      }
    }
    
    Also supports fallback "messages" list structure.
    """
    permission_classes = []

    def post(self, request):
        data = request.data
        session_id = data.get('sessionId') or data.get('session_id')
        message_text = data.get('message')

        # Fallback for original "messages" array format
        if not message_text and 'messages' in data:
            messages_list = data.get('messages', [])
            if messages_list and isinstance(messages_list, list):
                user_msgs = [m for m in messages_list if m.get('role') == 'user']
                if user_msgs:
                    message_text = user_msgs[-1].get('content')

        if not message_text:
            return Response(
                {"error": "Please provide a 'message' field in your request."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Manage/Create persistent session
        if not session_id:
            session_id = str(uuid.uuid4())

        session, created = ChatSession.objects.get_or_create(session_id=session_id)

        # 2. Save user message to database
        ChatMessage.objects.create(session=session, role='user', content=message_text)

        # 3. Retrieve recent conversation history for RAG / OpenAI context
        db_messages = ChatMessage.objects.filter(session=session).order_by('timestamp')
        openai_messages = []
        for msg in db_messages:
            openai_messages.append({
                'role': msg.role,
                'content': msg.content
            })

        # Limit conversation buffer size to past 10 messages for token control
        openai_messages = openai_messages[-10:]

        # 4. Generate response using OpenAIService
        bot_response = openai_service.generate_chat_response(openai_messages)
        assistant_reply = bot_response.get('content', '')

        # 5. Save assistant message to database
        ChatMessage.objects.create(session=session, role='assistant', content=assistant_reply)

        # 6. Extract dynamic product suggestions based on name/formula mentions in response
        product_suggestions = []
        active_products = Product.objects.filter(status='active').select_related('category')
        
        for prod in active_products:
            if len(product_suggestions) >= 3:
                break
            
            # Simple check if product name or chemical formula is mentioned in AI response
            name_mentioned = prod.name.lower() in assistant_reply.lower()
            formula_mentioned = prod.chemical_formula and prod.chemical_formula.lower() in assistant_reply.lower()
            
            if name_mentioned or formula_mentioned:
                img_url = None
                if prod.primary_image:
                    request_obj = self.request
                    if request_obj:
                        img_url = request_obj.build_absolute_uri(prod.primary_image.url)
                    else:
                        img_url = prod.primary_image.url
                        
                product_suggestions.append({
                    "id": prod.id,
                    "name": prod.name,
                    "slug": prod.slug,
                    "image": img_url,
                    "category": prod.category.name if prod.category else "Chemicals"
                })

        return Response({
            "message": assistant_reply,
            "sessionId": session_id,
            "productSuggestions": product_suggestions
        }, status=status.HTTP_200_OK)
