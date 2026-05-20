import os
from openai import OpenAI
from products.models import Product
from inventory.models import StockItem

class OpenAIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "mock-key")
        self.client = OpenAI(api_key=self.api_key)

    def generate_chat_response(self, messages):
        """
        Takes conversation history list: [{'role': 'user', 'content': '...'}, ...]
        Injects a dynamic context system prompt containing active chemicals, stocks, and specs.
        """
        # Fetch inventory context in real-time
        products = Product.objects.filter(status='active')
        inventory_context = []
        for p in products:
            stock = getattr(p, 'stock_item', None)
            qty = stock.quantity_on_hand if stock else 0.00
            inventory_context.append(
                f"- {p.name} (CAS: {p.cas_number or 'N/A'}, Formula: {p.chemical_formula or 'N/A'}): "
                f"Purity: {p.purity or 'N/A'}, Stock level: {qty} {p.unit_of_measure}, "
                f"Min Order: {p.min_order_quantity} {p.unit_of_measure}"
            )
        
        context_str = "\n".join(inventory_context)

        system_prompt = f"""You are Finstar AI, a certified industrial chemical database assistant.
We source and distribute bulk industrial chemicals, reagents, acids, and solvents in East Africa.
Strictly adhere to the following active real-time inventory catalog when answering user requests:
{context_str}

Rules:
1. If asked about stock, refer strictly to the real-time stock levels listed above.
2. If asked about quote requests or purchases, direct users to use the Quote Wizard (/quote).
3. If asked about MSDS safety sheets or Certificate of Analysis, state that they are available for download on the Product Detail page or upon request via Quote Wizard.
4. Keep explanations concise, professional, and safety-focused. Always remind clients to wear appropriate PPE when handling hazardous substances.
"""

        full_messages = [{"role": "system", "content": system_prompt}] + messages

        # Mock API if key is not configured for safe testing
        if self.api_key == "mock-key" or not self.api_key:
            last_user_message = messages[-1]["content"] if messages else ""
            return {
                "role": "assistant",
                "content": f"[DEBUG MOCK RESPONSE] Thank you for asking. Regarding '{last_user_message}': We stock high-purity industrial compounds under ISO 9001 quality guidelines. Please refer to our online Quote Wizard (/quote) to obtain pricing specifications."
            }

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo",
                messages=full_messages,
                temperature=0.2,
                max_tokens=300
            )
            return {
                "role": "assistant",
                "content": response.choices[0].message.content
            }
        except Exception as e:
            return {
                "role": "assistant",
                "content": f"I encountered an error querying the intelligence engine: {str(e)}. Please try again shortly."
            }

# Singleton instance
openai_service = OpenAIService()
