import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import archiver from "archiver";
import { NextRequest, NextResponse } from "next/server";
import { createReadStream, createWriteStream, unlink } from "fs";

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

async function prepareZipForDownload(eventNumber: number, objectKeys: any) {
  return new Promise(async (resolve: any, reject) => {
    const archive = archiver("zip");
    archive.on("error", (err) => {
      reject(err);
    });

    // Temporary file to save the archive
    const tempFilePath = "temp-archive.zip";
    const output = createWriteStream(tempFilePath);

    archive.pipe(output);

    for (let objectKey of objectKeys) {
      let getObjectResponse;
      try {
        getObjectResponse = (await s3Client.send(
          new GetObjectCommand({
            Bucket: process.env.AWS_DOWNLOAD_BUCKET_NAME,
            Key: objectKey,
          })
        )) as any;
        const photosPrefixToRemove = "foto_";
        let fileName = objectKey.split("/").pop() + ".jpg";
        if (fileName.startsWith(photosPrefixToRemove)) {
          fileName = fileName.slice(photosPrefixToRemove.length);
        }
        archive.append(getObjectResponse.Body, { name: fileName });
      } catch (error) {
        console.error("Error obteniendo el objeto de aws s3,", error);
        reject(error);
      }
    }

    archive.finalize();
    archive.on("end", () => {
      const archiveStream = createReadStream(tempFilePath);
      unlink(tempFilePath, (err) => {
        if (err) {
          console.error("Failed to delete temporary file:", err);
        } else {
          console.log("Temporary file deleted.");
        }
      });
      resolve(archiveStream);
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const { eventNumber } = await request.json();
    const objectKeys = await listObjects(eventNumber);
    if (objectKeys && objectKeys.length) {
      const archiveStream: any = await prepareZipForDownload(
        eventNumber,
        objectKeys
      );
      return new NextResponse(archiveStream, {
        // Here we tell the client browser that It has to download the response
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename=evento_${eventNumber}.zip`,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: "Evento no encontrado",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Ocurrio un error preparando el comprimido para descargar.",
      },
      { status: 500 }
    );
  }
}
