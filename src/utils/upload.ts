import axios from "axios";

export const uploadToCloudinary = async (
  file: File,
  resourceType: "image" | "video" = "image",
  onProgress?: (percent: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "myfarmsight");

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/ducorig4o/${resourceType}/upload`,
    formData,
    {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }
  );
  return res.data.secure_url;
};