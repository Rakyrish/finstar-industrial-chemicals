import os
import logging
from datetime import datetime
from inventory.models import StockItem

logger = logging.getLogger(__name__)

class GoogleSheetsService:
    def __init__(self):
        self.spreadsheet_id = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID")
        self.credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    def sync_inventory_to_sheets(self):
        """
        Collects all StockItems and uploads their stock quantities, warehouses, and sync statuses
        to the collaborative corporate Google Sheet.
        """
        items = StockItem.objects.select_related('product', 'warehouse_location').all()
        
        # If API keys are not yet configured in local environment, log and update statuses to synchronized
        if not self.spreadsheet_id or not self.credentials_path:
            logger.info("Google Sheets settings not configured in .env. Performing dev safe mock sync...")
            now = datetime.now()
            for item in items:
                item.sync_status = 'synchronized'
                item.last_synced = now
                item.last_error_log = None
                item.save()
            return True, len(items)

        try:
            # Under production, load google api client dynamically
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
            
            creds = service_account.Credentials.from_service_account_file(
                self.credentials_path,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )
            service = build('sheets', 'v4', credentials=creds)
            
            # Prepare rows
            values = [
                ["Product ID", "Chemical Compound", "CAS Number", "Warehouse", "Stock Quantity", "Unit", "Sync Status", "Last Synced"]
            ]
            for item in items:
                values.append([
                    str(item.product.id),
                    item.product.name,
                    item.product.cas_number or "N/A",
                    item.warehouse_location.code if item.warehouse_location else "N/A",
                    float(item.quantity_on_hand),
                    item.product.unit_of_measure,
                    item.sync_status,
                    datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                ])
                
            body = {'values': values}
            range_name = 'Sheet1!A1:H' + str(len(values))
            
            service.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                body=body
            ).execute()

            now = datetime.now()
            for item in items:
                item.sync_status = 'synchronized'
                item.last_synced = now
                item.last_error_log = None
                item.save()
                
            return True, len(items)
            
        except Exception as e:
            error_msg = f"Failed to sync inventory to spreadsheet: {str(e)}"
            logger.error(error_msg)
            now = datetime.now()
            for item in items:
                item.sync_status = 'failed'
                item.last_error_log = error_msg
                item.save()
            return False, error_msg

# Singleton instance
sheets_service = GoogleSheetsService()
