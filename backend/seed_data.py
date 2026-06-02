import os
import django
from django.utils import timezone
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from products.models import Category, Product, Tag
from inventory.models import StockItem, WarehouseLocation
from blog.models import BlogCategory, BlogPost, BlogTag
from inquiries.models import QuoteRequest, ContactMessage

User = get_user_model()

def seed():
    print("Starting database seeding...")
    user = User.objects.filter(is_staff=True).first()
    if not user:
        user = User.objects.create_superuser('admin', 'admin@finstar.com', 'admin123')
        print("Created superuser admin/admin123")

    # 1. Product Categories
    categories_data = [
        ("Solvents", "High-purity organic solvents for thinning, extraction, cleaning, and chemical synthesis."),
        ("Acids & Alkalis", "Corrosive reagents and basic raw materials for industrial pH adjustment, processing, and manufacturing."),
        ("Water Treatment", "Coagulants, disinfectants, and filtration aids for municipal and industrial water purification."),
        ("Industrial Cleaning", "Specialized formulations, surfactants, and degreasers for heavy-duty sanitation."),
        ("Food & Pharma", "Food-grade and pharmaceutical-grade chemical additives, preservatives, and excipients."),
    ]
    categories = {}
    for name, desc in categories_data:
        cat, created = Category.objects.get_or_create(
            name=name,
            defaults={"description": desc, "is_featured": True}
        )
        categories[name] = cat
        print(f"Category: {name} ({'created' if created else 'exists'})")

    # 2. Tags
    tag_names = ["GHS Compliant", "REACH Registered", "KEBS Certified", "Bulk Supply", "High Purity", "Hazardous"]
    tags = {}
    for name in tag_names:
        tag, created = Tag.objects.get_or_create(name=name)
        tags[name] = tag

    # 3. Warehouse Locations
    wh, created = WarehouseLocation.objects.get_or_create(
        name="Mombasa Central Depot",
        defaults={
            "code": "MMSA-01",
            "address": "Shimanzi Road, Mombasa, Kenya",
        }
    )

    # 4. Products & Stock
    products_data = [
        {
            "name": "Acetone 99.5% Tech Grade",
            "category": "Solvents",
            "short_description": "Fast-evaporating solvent commonly used as a thinner, degreaser, and extraction agent.",
            "description": "High-purity technical grade Acetone (Propanone). Highly volatile, flammable liquid with a characteristic pungent odor.",
            "long_description": "Finstar offers 99.5% pure Acetone in various packaging options. It is widely applied in fiberglass manufacturing, paint thinning, solvent extraction, and industrial surface degreasing. Store in a cool, well-ventilated location away from ignition sources.",
            "min_order_quantity": 200,
            "unit_of_measure": "L",
            "packaging_type": "200L Steel Drum",
            "pricing": "KES 14,500 per drum",
            "cas_number": "67-64-1",
            "chemical_formula": "C3H6O",
            "purity": "99.5% Min",
            "appearance": "Clear colorless liquid",
            "density": "0.791 g/cm³",
            "hazard_classification": "Flammable Liquid, Category 2",
            "stock_qty": 45,
            "safety_stock": 10,
            "tags_list": ["GHS Compliant", "Bulk Supply", "High Purity", "Hazardous"]
        },
        {
            "name": "Caustic Soda Pearls 99%",
            "category": "Acids & Alkalis",
            "short_description": "Sodium Hydroxide pearls used in soap making, water treatment, and industrial neutralization.",
            "description": "Premium industrial grade Caustic Soda Pearls (Sodium Hydroxide). Highly alkaline, hygroscopic white pearls.",
            "long_description": "Caustic Soda Pearls (NaOH) are a vital raw material for soaps, detergents, textiles, paper manufacturing, and pH control in water treatment. This product is highly corrosive to metals and skin. Handle with extreme caution using full PPE.",
            "min_order_quantity": 1000,
            "unit_of_measure": "kg",
            "packaging_type": "25kg PP Bag",
            "pricing": "KES 2,400 per bag",
            "cas_number": "1310-73-2",
            "chemical_formula": "NaOH",
            "purity": "99.0% Min",
            "appearance": "White spherical pearls",
            "density": "2.13 g/cm³",
            "hazard_classification": "Corrosive, Category 1A",
            "stock_qty": 1200,
            "safety_stock": 200,
            "tags_list": ["GHS Compliant", "KEBS Certified", "Bulk Supply", "Hazardous"]
        },
        {
            "name": "Hydrochloric Acid 33%",
            "category": "Acids & Alkalis",
            "short_description": "Highly corrosive strong mineral acid used in steel pickling, ore processing, and cleaning.",
            "description": "Technical grade Hydrochloric Acid (HCl 33%). Pungent, fumes in moist air, highly corrosive.",
            "long_description": "Finstar's 33% Hydrochloric Acid is suited for metal pickling, chemical synthesis, stone/brick cleaning, and oil well acidification. Highly reactive with metals, releasing flammable hydrogen gas. Store only in specialized acid-resistant containers.",
            "min_order_quantity": 1000,
            "unit_of_measure": "L",
            "packaging_type": "1000L IBC Tote",
            "pricing": "KES 110,000 per IBC",
            "cas_number": "7647-01-0",
            "chemical_formula": "HCl",
            "purity": "33.0% Min",
            "appearance": "Clear light-yellowish liquid",
            "density": "1.16 g/cm³",
            "hazard_classification": "Corrosive, Category 1B",
            "stock_qty": 3,  # Low stock alert trigger
            "safety_stock": 5,
            "tags_list": ["GHS Compliant", "Hazardous", "Bulk Supply"]
        },
        {
            "name": "Citric Acid Anhydrous Food Grade",
            "category": "Food & Pharma",
            "short_description": "Natural preservative and sour flavoring agent for food, beverages, and cosmetic formulas.",
            "description": "High-purity food-grade Citric Acid Anhydrous. Fine white crystalline powder.",
            "long_description": "Citric Acid Anhydrous is widely used as an acidulant, flavor enhancer, and preservative in beverages, jams, candies, and cosmetics. Meets FCC/USP standards. Store in a dry, cool place to prevent caking.",
            "min_order_quantity": 25,
            "unit_of_measure": "kg",
            "packaging_type": "25kg Kraft Paper Bag",
            "pricing": "KES 3,800 per bag",
            "cas_number": "77-92-9",
            "chemical_formula": "C6H8O7",
            "purity": "99.8% Min",
            "appearance": "White crystalline powder",
            "density": "1.665 g/cm³",
            "hazard_classification": "Mild Irritant, Category 2A",
            "stock_qty": 3500,
            "safety_stock": 500,
            "tags_list": ["High Purity", "KEBS Certified"]
        }
    ]

    for p_data in products_data:
        cat_name = p_data.pop("category")
        stock_qty = p_data.pop("stock_qty")
        safety_stock = p_data.pop("safety_stock")
        tags_list = p_data.pop("tags_list")

        prod, created = Product.objects.get_or_create(
            name=p_data["name"],
            defaults={
                "slug": p_data["name"].lower().replace(" ", "-").replace("%", "").replace(".", ""),
                "category": categories[cat_name],
                "short_description": p_data["short_description"],
                "description": p_data["description"],
                "long_description": p_data["long_description"],
                "min_order_quantity": p_data["min_order_quantity"],
                "unit_of_measure": p_data["unit_of_measure"],
                "packaging_type": p_data["packaging_type"],
                "pricing": p_data["pricing"],
                "cas_number": p_data["cas_number"],
                "chemical_formula": p_data["chemical_formula"],
                "purity": p_data["purity"],
                "appearance": p_data["appearance"],
                "density": p_data["density"],
                "hazard_classification": p_data["hazard_classification"],
                "status": "active",
                "is_featured": True,
                "is_new": True,
                "cloudinary_url": "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", # Sample placeholder
            }
        )

        for t_name in tags_list:
            prod.tags.add(tags[t_name])

        # Stock
        StockItem.objects.update_or_create(
            product=prod,
            defaults={
                "warehouse_location": wh,
                "quantity_on_hand": stock_qty,
                "safety_stock_level": safety_stock,
            }
        )
        print(f"Product: {prod.name} (Stock: {stock_qty}) ({'created' if created else 'exists'})")

    # 5. Blog Posts
    blog_categories = ["Chemical Safety", "Sourcing Guides", "Industrial News"]
    b_cats = {}
    for name in blog_categories:
        cat, created = BlogCategory.objects.get_or_create(name=name)
        b_cats[name] = cat

    btag, created = BlogTag.objects.get_or_create(name="Safety")

    blog_posts_data = [
        {
            "title": "Safe Handling and Storage of Concentrated Acids",
            "category": "Chemical Safety",
            "excerpt": "Learn the essential protocols for handling, storing, and disposing of industrial-strength acids safely.",
            "content": "<h2>Introduction to Acid Safety</h2><p>Industrial manufacturing heavily relies on concentrated acids like Hydrochloric, Sulphuric, and Nitric acids. While indispensable, their corrosive nature demands strict safety protocols.</p><h3>Storage Guidelines</h3><ul><li>Keep acids in original, label-certified containers.</li><li>Ensure secondary containment is acid-resistant (e.g. polyethylene tray).</li><li>Separate acids from alkalis, active metals, and organic solvents.</li></ul><h3>PPE Checklist</h3><p>Always wear acid-resistant gloves, full face shield, and chemical apron when transferring acids. Have a functional spill kit and emergency eye-wash station within 10 seconds reach.</p>",
            "reading_time": 6,
        },
        {
            "title": "Sourcing Industrial Raw Materials in Kenya, Uganda, Tanzania, and Rwanda",
            "category": "Sourcing Guides",
            "excerpt": "A comprehensive guide to logistics, quality certifications, and chemical standards in Kenya and Mombasa port.",
            "content": "<h2>The Chemical Supply Chain</h2><p>Sourcing chemicals efficiently in Kenya, Uganda, Tanzania, and Rwanda requires understanding compliance with KEBS, GHS labeling, and customs clearing at the Port of Mombasa.</p><h3>Vetting Suppliers</h3><p>Always verify your supplier provides up-to-date Material Safety Data Sheets (MSDS) and Certificates of Analysis (COA) for every batch of chemicals delivered.</p>",
            "reading_time": 8,
        }
    ]

    for b_data in blog_posts_data:
        cat_name = b_data.pop("category")
        post, created = BlogPost.objects.get_or_create(
            title=b_data["title"],
            defaults={
                "slug": b_data["title"].lower().replace(" ", "-"),
                "category": b_cats[cat_name],
                "excerpt": b_data["excerpt"],
                "content": b_data["content"],
                "author": user,
                "author_name": "Dr. Sarah Wambui",
                "reading_time": b_data["reading_time"],
                "status": "published",
                "published_at": timezone.now(),
                "cover_image_url": "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
            }
        )
        post.tags.add(btag)
        print(f"Blog post: {post.title} ({'created' if created else 'exists'})")

    # 6. Inquiries & Quote Requests
    inq, created = ContactMessage.objects.get_or_create(
        email="john@pioneersoaps.co.ke",
        defaults={
            "full_name": "John Ndwiga",
            "company": "Pioneer Soap Manufacturers",
            "phone": "+254 712 345 678",
            "message": "Hi, we are looking for a regular supplier of Caustic Soda Pearls and Sodium Silicate. Could you send us your bulk pricing for 10-ton monthly orders?",
        }
    )

    qr, created = QuoteRequest.objects.get_or_create(
        full_name="Fatuma Ali",
        company="Coastal Water Works",
        defaults={
            "email": "fatuma@coastalwater.go.ke",
            "phone": "+254 722 888 999",
            "product": Product.objects.filter(name__icontains="Caustic").first(),
            "quantity": 5000,
            "unit_of_measure": "kg",
            "additional_notes": "Need GHS compliant labels and KEBS batch certificates.",
        }
    )
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
