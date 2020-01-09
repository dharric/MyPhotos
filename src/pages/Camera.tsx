import React, { useCallback, useEffect } from "react";
import {
  CameraResultType,
  FilesystemDirectory,
  Plugins,
  Capacitor
} from "@capacitor/core";
import { useCamera, availableFeatures } from "@ionic/react-hooks/camera";
import { useStorage } from "@ionic/react-hooks/storage";
import moment from "moment";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonPage,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonItemDivider
} from "@ionic/react";

const Camera: React.FC = () => {
  const { Filesystem } = Plugins;
  const { photo, getPhoto } = useCamera();
  const { get, set } = useStorage();
  const triggerCamera = useCallback(async () => {
    if (availableFeatures.getPhoto) {
      await getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri
      });
    }
  }, [getPhoto]);

  useEffect(() => {
    if (photo) {
      console.log("photo", photo);

      Filesystem.readFile({
        path: photo ? photo.path || photo.webPath || "" : ""
      })
        .then(photoInTemp => {
          let date = moment().format("MM-DD-YY-h-mm-ss");
          let fileName = date + ".jpg";
          console.log("fileName", fileName);

          // copy file into local filesystem, as temp will eventually be deleted
          Filesystem.writeFile({
            data: photoInTemp.data,
            path: fileName,
            directory: FilesystemDirectory.Data
          }).then(() => {
            // now we try to read the file
            Filesystem.getUri({
              directory: FilesystemDirectory.Data,
              path: fileName
            }).then(async finalPhotoUri => {
              console.log("file uri", finalPhotoUri.uri);
              const photoUrl = Capacitor.convertFileSrc(finalPhotoUri.uri);
              console.log("final photo url", photoUrl);

              const existingImageNames = await get("imageNames");
              let imageNames = existingImageNames || "";
              imageNames = imageNames + "," + fileName;
              await set("imageNames", imageNames);
              console.log("test image name saved", await get("imageNames"));

              const imagePaths = await get("imagePaths");
              const imagePathsArray = imagePaths ? JSON.parse(imagePaths) : [];
              imagePathsArray.push({
                fileName,
                photoUrl
              });
              const imagePathsArrayString = JSON.stringify(imagePathsArray);
              await set("imagePaths", imagePathsArrayString);
              console.log("test image paths saved", await get("imagePaths"));
            });
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [photo, Filesystem]);

  const onClick = () => {
    triggerCamera();
  };

  if (availableFeatures.getPhoto) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Camera</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonItemDivider>
              <IonCardHeader>
                <IonCardTitle>My Photo</IonCardTitle>
              </IonCardHeader>
            </IonItemDivider>
            <IonCardContent>
              {photo && <img src={photo.webPath} alt="my pic" />}
              <IonButton style={{ marginTop: ".75em" }} onClick={onClick}>
                camera
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }
  return (
    <IonPage>
      <IonContent>
        <IonText>No Camera Available</IonText>
      </IonContent>
    </IonPage>
  );
};

export default Camera;
