import React, { useCallback, useEffect, useState } from "react";
import {
  CameraResultType,
  FilesystemDirectory,
  Capacitor,
  CameraSource
} from "@capacitor/core";
import { useCamera, availableFeatures } from "@ionic/react-hooks/camera";
import { useFilesystem } from "@ionic/react-hooks/filesystem";
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
export const LOG_PREFIX = "[Camera] ";

const Camera: React.FC = () => {
  const { readFile, writeFile, getUri } = useFilesystem();
  const { photo, getPhoto } = useCamera();
  const [lastWebPath, setLastWebPath] = useState("");
  const [lastPhotoPath, setLastPhotoPath] = useState("");
  const { get, set } = useStorage();
  const triggerCamera = useCallback(async () => {
    if (availableFeatures.getPhoto) {
      await getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
    }
  }, [getPhoto]);

  useEffect(() => {
    if (photo && photo.webPath !== lastWebPath) {
      setLastWebPath(photo.webPath || "");
      console.log(LOG_PREFIX + "photo.webPath", photo.webPath);
      console.log(LOG_PREFIX + "lastWebPath", lastWebPath);

      readFile({
        path: photo ? photo.path || photo.webPath || "" : ""
      })
        .then(photoInTemp => {
          let date = moment().format("MM-DD-YY-h-mm-ss");
          let fileName = date + ".jpg";

          // copy file into local filesystem, as temp will eventually be deleted
          writeFile({
            data: photoInTemp.data,
            path: fileName,
            directory: FilesystemDirectory.Documents
          }).then(() => {
            // now we try to read the file
            getUri({
              directory: FilesystemDirectory.Documents,
              path: fileName
            }).then(async finalPhotoUri => {
              const filePath = finalPhotoUri.uri;
              const photoUrl = Capacitor.convertFileSrc(filePath);
              if (photoUrl !== lastPhotoPath) {
                setLastPhotoPath(photoUrl);
              }

              const imagePaths = await get("imagePaths");
              const imagePathsArray = imagePaths ? JSON.parse(imagePaths) : [];
              imagePathsArray.push({
                fileName
              });
              const imagePathsArrayString = JSON.stringify(imagePathsArray);
              await set("imagePaths", imagePathsArrayString);
              console.log(LOG_PREFIX + "imagePaths", await get("imagePaths"));
            });
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [
    photo,
    readFile,
    writeFile,
    getUri,
    get,
    set,
    lastPhotoPath,
    lastWebPath
  ]);

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
              {lastPhotoPath && <img src={lastPhotoPath} alt="my pic" />}
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
