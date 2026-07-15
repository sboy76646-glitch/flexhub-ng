const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const PRODUCT_IMAGE_RULES = {
  maxBytes: 5 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  accept: ".jpg,.jpeg,.png,.webp",
};

export function validateProductImage(file) {
  if (!file) {
    return "Choose a product image.";
  }

  if (!PRODUCT_IMAGE_RULES.acceptedTypes.includes(file.type)) {
    return "Use a JPG, PNG or WebP image.";
  }

  if (file.size > PRODUCT_IMAGE_RULES.maxBytes) {
    return "The image must be 5 MB or smaller.";
  }

  return "";
}

function validateCloudinaryConfig() {
  if (!CLOUD_NAME) {
    throw new Error(
      "VITE_CLOUDINARY_CLOUD_NAME is missing from client/.env."
    );
  }

  if (!UPLOAD_PRESET) {
    throw new Error(
      "VITE_CLOUDINARY_UPLOAD_PRESET is missing from client/.env."
    );
  }
}

export async function uploadProductImage(file) {
  validateCloudinaryConfig();

  const validationError = validateProductImage(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUD_NAME)}/image/upload`;

  let response;

  try {
    response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Unable to reach Cloudinary. Check your internet connection and try again."
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Cloudinary returned an invalid response.");
  }

  if (!response.ok) {
    const cloudinaryMessage =
      data?.error?.message ||
      `Cloudinary upload failed with status ${response.status}.`;

    throw new Error(cloudinaryMessage);
  }

  if (!data.secure_url || !data.public_id) {
    throw new Error("Cloudinary did not return complete image details.");
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