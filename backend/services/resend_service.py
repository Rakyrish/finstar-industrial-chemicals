import os
import requests
import logging

logger = logging.getLogger(__name__)

class ResendEmailService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY", "mock-key")
        self.api_url = "https://api.resend.com/emails"
        self.default_from = os.getenv("DEFAULT_FROM_EMAIL", "Finstar Sourcing <sales@finstarindustrial.com>")

    def send_email(self, to, subject, html_content):
        """
        Sends an email using the Resend API service.
        Falls back to console logger if RESEND_API_KEY is not set in .env.
        """
        if self.api_key == "mock-key" or not self.api_key:
            logger.info("Resend API Key not configured. Simulating email dispatch...")
            logger.info(f"TO: {to}")
            logger.info(f"SUBJECT: {subject}")
            logger.info(f"HTML:\n{html_content}")
            return True, "Mock Dispatch Success"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": self.default_from,
            "to": [to] if isinstance(to, str) else to,
            "subject": subject,
            "html": html_content
        }

        try:
            response = requests.post(self.api_url, json=payload, headers=headers)
            if response.status_code in [200, 201]:
                return True, response.json()
            else:
                logger.error(f"Resend dispatch failed with code {response.status_code}: {response.text}")
                return False, response.text
        except Exception as e:
            logger.error(f"Exception during Resend dispatch: {str(e)}")
            return False, str(e)

# Singleton instance
resend_service = ResendEmailService()
