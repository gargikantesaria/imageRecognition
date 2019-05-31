import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ImageProvider } from '../../providers/image/image';
import { Camera } from '@ionic-native/camera';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public addItemsForm: FormGroup;
  public imageSet: boolean = false;
  public imgPreview;
  public itemPicturesStoreURL;
  public imageObjects = [];
  public faceInImage = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
    public imageProvider: ImageProvider, private camera: Camera) {
    this.addItemsForm = new FormGroup({
      'itemTitle': new FormControl('', Validators.required),
    })
    this.imgPreview = "/assets/imgs/logo.png";
  }

  // Take a picture from camera or photo library
  getPhoto() {
    this.alertCtrl.create({
      title: 'Profile Picture',
      message: 'From where do you want to choose your item pic?',
      buttons: [
        {
          text: 'Cancel',
          handler: data => { }
        },
        {
          text: 'Choose from gallery',
          handler: () => {
            // Call imageProvider to process, upload, and update user photo.
            this.imageProvider.setProfilePhoto('', this.camera.PictureSourceType.PHOTOLIBRARY).then(data => {
              this.imgPreview = data;
              this.imageSet = true;
            });
          }
        },
        {
          text: 'Take my photo',
          handler: () => {
            // Call imageProvider to process, upload, and update user photo.
            this.imageProvider.setProfilePhoto('', this.camera.PictureSourceType.CAMERA).then(data => {
              this.imgPreview = data;
              this.imageSet = true;
            });
          }
        }
      ]
    }).present();
  }

  // Submit the item form
  submitForm() {
    if (this.imageSet) {
      let imageName = 'TestingImage';
      this.imageProvider.uploadImage(this.imgPreview, imageName).then((res: any) => {
        this.itemPicturesStoreURL = res;
        this.imageProvider.getObjectRecognition(res.Bucket, res.Key).then((response:any) => {
          this.imageObjects = [...response.Labels];
          this.imageProvider.faceDetection(res.Bucket, res.Key).then((detectedData:any) => {
            console.log("deteceted data is", detectedData);
            this.faceInImage = detectedData.FaceDetails;
          }).catch((errs) => {
            console.log("error in detection data", errs);
          })
        }).catch((error) => {
          console.log("error detection", error);
        });

      }).catch((err) => {
        console.log("Error is", err)
      })
    }
  }

}
