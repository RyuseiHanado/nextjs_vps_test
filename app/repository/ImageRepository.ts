import {load} from 'ts-dotenv';
import {_Object, GetObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';

const env = load({
    MINIO_BUCKET_NAME: String,
    MINIO_ACCESS_KEY_ID: String,
    MINIO_SECRET_ACCESS_KEY: String,
    MINIO_REGION: String,
    MINIO_ENDPOINT: String,
});

const s3Client = new S3Client({
    region: env.MINIO_REGION,
    credentials: {accessKeyId: env.MINIO_ACCESS_KEY_ID, secretAccessKey: env.MINIO_SECRET_ACCESS_KEY},
    endpoint: env.MINIO_ENDPOINT,
});

export const uploadImage = async (file: File, tableId: number) => {
    try {
        const buffer = Buffer.from(await file?.arrayBuffer());
        const uploadParams: any = {
            Bucket: env.MINIO_BUCKET_NAME,
            Key: `${tableId}/${file.name}`,
            Body: buffer,
            ContentType: "image/png",
            ACL: "public-read",
        };
        const command = new PutObjectCommand(uploadParams);
        const data = await s3Client.send(command);
        console.log(
            'Successfully uploaded object: ' +
            uploadParams.Bucket +
            '/' +
            uploadParams.Key,
            'Etag: ' + data.ETag
        );
    } catch (err) {
        console.log('Error', err);
    }
};

export const getFile = async (key: string): Promise<Uint8Array | undefined> => {
    try {
        const bucketParams = {
            Bucket: env.MINIO_BUCKET_NAME,
            Delimiter: "/",
            Key: key!,
        };
        const s3Response = await s3Client.send(new GetObjectCommand(bucketParams));
        return await s3Response.Body?.transformToByteArray()
    } catch (err) {
        console.log('Error', err);
    }
}
export const getFileList = async (key: number): Promise< _Object[] | undefined> => {
    try {
        const prefix = `${key}/`; // 取得したいオブジェクト名を指定
        const bucketParams = {
            Bucket: env.MINIO_BUCKET_NAME,
            Prefix: prefix, // 省略可能
            Delimiter: '/', // 省略可能
        };
        const data = await s3Client.send(new ListObjectsCommand(bucketParams));
        return data.Contents
    } catch (err) {
        console.log('Error', err);
    }
}