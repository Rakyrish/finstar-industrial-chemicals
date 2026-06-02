from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_expand_product_seo_text_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='seo_description',
            field=models.CharField(blank=True, max_length=220, null=True),
        ),
        migrations.AddField(
            model_name='category',
            name='seo_keywords',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='category',
            name='seo_title',
            field=models.CharField(blank=True, max_length=90, null=True),
        ),
    ]
