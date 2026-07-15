const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "l4mrjyfd";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "flexhub_products";

export const PRODUCT_IMAGE_RULES = {
  maxBytes: 5 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  accept: ".jpg,.jpeg,.png,.webp",
};

export function validateProductImage(file) {
  if (!file) return "Choose a product image.";

  if (!PRODUCT_IMAGE_RULES.acceptedTypes.includes(file.type)) {
    return "Use a JPG, PNG or WebP image.";
  }

  if (file.size > PRODUCT_IMAGE_RULES.maxBytes) {
    return "The image must be 5 MB or smaller.";
  }

  return "";
}

export async function uploadProductImage(file) {
  const validationError = validateProductImage(file);
  if (validationError) throw new Error(validationError);

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Image upload failed. Please try again.");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}
