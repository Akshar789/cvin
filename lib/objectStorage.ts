import { Storage, File } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return { bucketName, objectName };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
  contentType,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
  contentType?: string;
}): Promise<string> {
  const request: any = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  
  if (contentType) {
    request.content_type = contentType;
  }
  
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to sign object URL, errorcode: ${response.status}`);
  }
  
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

export class VideoStorageService {
  private privateObjectDir: string;

  constructor() {
    this.privateObjectDir = process.env.PRIVATE_OBJECT_DIR || "";
  }

  isConfigured(): boolean {
    return !!this.privateObjectDir;
  }

  async getVideoUploadURL(userId: string, questionId: number): Promise<{ uploadURL: string; objectPath: string }> {
    if (!this.privateObjectDir) {
      throw new Error("Object storage not configured. Please set PRIVATE_OBJECT_DIR env var.");
    }

    const objectId = `interview-videos/${userId}/${questionId}_${randomUUID()}.webm`;
    const fullPath = `${this.privateObjectDir}/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const uploadURL = await signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
      contentType: "video/webm",
    });

    return { uploadURL, objectPath: `/objects/${objectId}` };
  }

  async getVideoDownloadURL(objectPath: string): Promise<string> {
    if (!this.privateObjectDir) {
      throw new Error("Object storage not configured.");
    }

    const entityId = objectPath.replace(/^\/objects\//, "");
    const fullPath = `${this.privateObjectDir}/${entityId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    return signObjectURL({
      bucketName,
      objectName,
      method: "GET",
      ttlSec: 3600,
    });
  }

  async deleteVideo(objectPath: string): Promise<void> {
    if (!this.privateObjectDir) {
      throw new Error("Object storage not configured.");
    }

    const entityId = objectPath.replace(/^\/objects\//, "");
    const fullPath = `${this.privateObjectDir}/${entityId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    
    try {
      await file.delete();
    } catch (error: any) {
      if (error.code !== 404) {
        throw error;
      }
    }
  }

  async getVideoFile(objectPath: string): Promise<File> {
    if (!this.privateObjectDir) {
      throw new Error("Object storage not configured.");
    }

    const entityId = objectPath.replace(/^\/objects\//, "");
    const fullPath = `${this.privateObjectDir}/${entityId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    
    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    
    return file;
  }

  async downloadVideoBuffer(objectPath: string): Promise<Buffer> {
    const file = await this.getVideoFile(objectPath);
    const [buffer] = await file.download();
    return buffer;
  }
}

export const videoStorageService = new VideoStorageService();
