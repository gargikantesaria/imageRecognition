import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import * as AWS from 'aws-sdk';

@Injectable()
export class ImageProvider {

  private options: CameraOptions = {
    targetWidth: 384,
    targetHeight: 384,
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  constructor(private camera: Camera) {
    AWS.config.accessKeyId = 'AWS_ACCESSKEY';
    AWS.config.secretAccessKey = 'AWS_SECRETKEY';
    AWS.config.region = 'us-east-1';
    AWS.config.signatureVersion = 'v4';
  }

  setProfilePhoto(name, sourceType): Promise<any> {
    return new Promise((resolve, reject) => {
      this.options.sourceType = sourceType;
      this.camera.getPicture(this.options).then((res) => {
        let base64Image = 'data:image/jpeg;base64,' + res;
        resolve(base64Image);
      }).catch((err) => {
        reject(err);
      })
    })
  }

  uploadImage(image, imageName) {
    return new Promise((resolve, reject) => {

      const body = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const ext = image.split(';')[0].split('/')[1] || 'jpg';
      let date = Date.now();
      const key = imageName + date;

      this.s3Putimage({ body, mime: `image/${ext}` }, key, 'base64').then((result) => { resolve(result); }).catch((err) => { reject(err); });
    })
  }

  // To put the image in S3 Bucket
  s3Putimage(file, key, encoding) {
    return new Promise((resolve, reject) => {
      
      let s3 = new AWS.S3();

      const params = {
        Body: file.body,
        Bucket: 'BUCKET_NAME',
        Key: key,
        ACL: "public-read",
      };

      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    })
  }
  // To recognise the objects in the images
  getObjectRecognition(bucketName, imageUrl) {
    return new Promise((resolve, reject) => {
      let rekognition = new AWS.Rekognition();

      let imageParams = {
        Image: {
          S3Object: {
            Bucket: bucketName,
            Name: imageUrl
          }
        },
        MaxLabels: 123,
        MinConfidence: 80
      };

      rekognition.detectLabels(imageParams, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    })
  }
  // To detect the faces in the image
  faceDetection(bucketName, imageUrl) {
    return new Promise((resolve, reject) => {
      let rekognition = new AWS.Rekognition();
      let params = {
        Image: {
          S3Object: {
            Bucket: bucketName,
            Name: 'Artboard 55.png'
          }
        },
        Attributes: [
          "ALL", "DEFAULT"
        ]
      }
      rekognition.detectFaces(params, (errs, datas) => {
        if(errs) {
          reject(errs)
        } else {
          resolve(datas);
        }
      })
    })
  }

}
