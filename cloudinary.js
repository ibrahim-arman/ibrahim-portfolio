// Cloudinary helpers. Only the cloud name and an UNSIGNED preset are used here.
// Never put your Cloudinary API secret in frontend code.
export const CLOUD_NAME = "ikkw623q";
export const UPLOAD_PRESET = "portfolio_unsigned";

// Upload an image File and get back its public URL
export async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Image upload failed");
  return data.secure_url;
}

// Make an uploaded image smaller/faster (auto format + quality + max width)
export function optimize(url, width = 800) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
