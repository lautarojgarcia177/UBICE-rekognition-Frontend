import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import archiver from "archiver";
import { NextRequest, NextResponse } from "next/server";

const awsRegion = process.env.ES_AWS_REGION;
const awsAccessKeyId = process.env.EDGE_STORE_ACCESS_KEY as string;
const awsSecretAccessKey = process.env.EDGE_STORE_SECRET_KEY as string;

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
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Prefix: `event_${eventNumber}eventNumber`,
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

async function prepareZipForDownload(
  eventNumber: string,
  objectKeys: any,
  res: any
) {
  return new Promise(async (resolve: any, reject) => {
    // Here we tell the client browser that It has to download the response
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=evento_${eventNumber}.zip`
    );
    const archive = archiver("zip");
    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(res);

    for (let objectKey of objectKeys) {
      let getObjectResponse;
      try {
        getObjectResponse = (await s3Client.send(
          new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: objectKey,
          })
        )) as any;
        const fileName = objectKey.split("/").pop();
        archive.append(getObjectResponse.Body, { name: fileName });
      } catch (error) {
        console.error("Error obteniendo el objeto de aws s3,", error);
        reject(error);
      }
    }

    archive.finalize();
    archive.on("end", () => {
      resolve();
    });
  });
}

export async function POST(request: NextRequest) {
  const response = new Response();
  try {
    const { uploadPackageId } = request.body as any;
    const objectKeys = await listObjects(uploadPackageId);
    if (objectKeys && objectKeys.length) {
      await prepareZipForDownload(uploadPackageId, objectKeys, response);
    } else {
      return NextResponse.json(
        {
          error: "id del paquete de subida no encontrado",
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
