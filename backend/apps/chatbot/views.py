from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.openai_service import openai_service


class ChatbotMessageView(APIView):
    """
    Exposes chat agent lookup API to interact with the high-purity chemical RAG engine.
    Expects payload format:
    {
      "messages": [
         {"role": "user", "content": "Query text here..."}
      ]
    }
    """
    def post(self, request):
        messages = request.data.get('messages', None)
        if not messages or not isinstance(messages, list):
            return Response(
                {"error": "Please provide a valid conversation messages history list."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Clean formatting validation
        cleaned_messages = []
        for m in messages:
            if 'role' in m and 'content' in m:
                cleaned_messages.append({
                    'role': m['role'],
                    'content': m['content']
                })
                
        if not cleaned_messages:
            return Response(
                {"error": "No valid message objects found in history list."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call intelligence layer
        bot_response = openai_service.generate_chat_response(cleaned_messages)
        
        return Response(bot_response, status=status.HTTP_200_OK)
