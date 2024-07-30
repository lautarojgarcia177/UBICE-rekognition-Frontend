import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const awsRegion = process.env.ES_AWS_REGION;
const awsAccessKeyId = process.env.ES_AWS_ACCESS_KEY_ID as string;
const awsSecretAccessKey = process.env.ES_AWS_SECRET_ACCESS_KEY as string;

const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

async function listObjects(eventNumber: number) {
  try {
    const objectKeys = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_DOWNLOAD_BUCKET_NAME,
        Prefix: `evento_${eventNumber}`,
      })
    );
    if (objectKeys && objectKeys.Contents) {
      return objectKeys.Contents.map((o) => o.Key);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error listando los objetos de S3", error);
  }
}

async function getS3ObjectSignedUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_DOWNLOAD_BUCKET_NAME,
      Key: key,
    });
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 10000,
    });
    return signedUrl;
  } catch (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { eventNumber } = await request.json();
    const objectKeys = await listObjects(eventNumber);
    if (objectKeys && objectKeys.length) {
      // obtain list of signedUrls
      let presignedUrls = [];
      for (let objectKey of objectKeys) {
        if (objectKey) {
          const presignedUrl = await getS3ObjectSignedUrl(objectKey);
          presignedUrls.push(presignedUrl);
        }
      }
      return NextResponse.json({ presignedUrls });
    } else {
      return NextResponse.json(
        {
          error: "Evento no encontrado",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Ocurrio un error preparando el comprimido para descargar.",
      },
      { status: 500 }
    );
  }
}
