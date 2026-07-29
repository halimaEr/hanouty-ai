import uuid
from fastapi import UploadFile
from supabase_client import supabase


def upload_image(file: UploadFile, folder: str = "produits"):

    #  extension
    ext = file.filename.split(".")[-1]

    #  nom unique du fichier (PATH dans storage)
    file_path = f"{folder}/{uuid.uuid4()}.{ext}"

    #  lire le fichier
    content = file.file.read()

    # upload vers Supabase Storage
    supabase.storage.from_("produits-images").upload(
        file_path,
        content,
        file_options={
            "content-type": file.content_type
        }
    )

    #  générer URL publique
    file_url = supabase.storage.from_("produits-images").get_public_url(file_path)

    #  retourner LES DEUX (IMPORTANT)
    return {
        "file_url": file_url,
        "file_path": file_path
    }