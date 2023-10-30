import { useRef } from "react";

interface FileUploaderProps {
  fieldName: string;
  onChange: Function;
  name: string;
  s3Path: string;
  disabled?: boolean;
  accept: string;
  setError: Function;
}

export default function FileUploader({
  fieldName,
  onChange,
  name,
  s3Path,
  disabled,
  accept,
  setError,
}: FileUploaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  const uploader = async (file: File, keyName: string): Promise<void> => {
    try {
      const extension = "." + file.type.slice(file.type.indexOf("/") + 1);
      const response = await fetch(
        process.env.NEXT_PUBLIC_FILE_UPLOAD_URL_WORKER + keyName + extension,
        {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "Content-Length": file.size.toString(),
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
          },
          body: file,
        }
      );

      const data = await response.json();
      return data.fileURL;
    } catch (error) {
      setError("Error uploading your file, please try again");
    }
  };

  const onSelectedFile = async () => {
    if (fileInput.current?.files?.length) {
      if (fileInput.current.files[0].size > 3000000) {
        setError("File size should be less than 3MB");
        fileInput.current.value = "";
        return;
      }
      const file = fileInput.current.files[0];
      const fileURL = await uploader(file, s3Path);
      onChange({ target: { name: name, value: fileURL } });
    }
  };

  return (
    <input
      type="file"
      name={fieldName}
      ref={fileInput}
      onChange={onSelectedFile}
      aria-label="File upload"
      className="file-input file-input-bordered w-full max-w-xs"
      disabled={disabled}
      accept={accept}
    />
  );
}
