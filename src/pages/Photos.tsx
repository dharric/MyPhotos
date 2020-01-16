import React, { useState } from "react";
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonLabel,
  useIonViewWillEnter,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonAvatar,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton
} from "@ionic/react";
import { useStorage } from "@ionic/react-hooks/storage";
import { FilesystemDirectory, Capacitor } from "@capacitor/core";
import { useFilesystem } from "@ionic/react-hooks/filesystem";
import "./Photos.css";

export const LOG_PREFIX = "[Photos] ";

const Photos: React.FC = () => {
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [photoItems, setPhotoItems] = useState<JSX.Element[] | null>(null);
  const { getUri } = useFilesystem();
  const { get, set } = useStorage();

  useIonViewWillEnter(async () => {
    setIonListItems();
  });

  const setIonListItems = async () => {
    const imgPaths = await get("imagePaths");
    const images = imgPaths ? JSON.parse(imgPaths) : null;
    console.log(LOG_PREFIX + "images", images);

    if (images && images.length > 0) {
      const photos: JSX.Element[] = [];
      for await (let image of images) {
        console.log(LOG_PREFIX + "checking if file exists", image.fileName);
        const finalPhotoUri = await getUri({
          directory: FilesystemDirectory.Documents,
          path: image.fileName
        });
        console.log(LOG_PREFIX + "image.fileName", image.fileName);
        console.log(LOG_PREFIX + "finalPhotoUri", finalPhotoUri);
        const photoUrl = Capacitor.convertFileSrc(finalPhotoUri.uri);
        console.log(LOG_PREFIX + "converted photoUrl", photoUrl);

        photos.push(
          <IonItemSliding key={image.fileName}>
            <IonItem
              data-name={image.fileName}
              data-path={photoUrl}
              onClick={onClickSelectPhoto}
            >
              <IonAvatar slot="start">
                {photoUrl && <img src={photoUrl} alt="my pic" />}
              </IonAvatar>
              <IonLabel>{image.fileName}</IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption onClick={onClickDelete} data-name={image.fileName}>
                Delete
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        );
      }

      console.log(LOG_PREFIX + "setPhotoItems");
      setPhotoItems(photos);
    }
  };

  const onClickDelete = async (
    e: React.MouseEvent<HTMLIonItemOptionElement, MouseEvent>
  ) => {
    const fileName = e.currentTarget.getAttribute("data-name");
    const imgPaths = await get("imagePaths");
    const images = imgPaths ? JSON.parse(imgPaths) : null;
    const newImgPaths = [];
    if (imgPaths) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.fileName !== fileName) {
          newImgPaths.push({
            fileName: img.fileName
          });
        }
      }
    }
    const newImagePaths = JSON.stringify(newImgPaths);
    await set("imagePaths", newImagePaths);
    setIonListItems();
  };

  const onClickSelectPhoto = (
    e: React.MouseEvent<HTMLIonItemElement, MouseEvent>
  ) => {
    const fileName = e.currentTarget.getAttribute("data-name");
    const photoUrl = e.currentTarget.getAttribute("data-path");
    setCurrentFileName(fileName || "");
    setCurrentPhotoUrl(photoUrl || "");
    toggleModalPic();
  };

  const toggleModalPic = () => {
    setShowModal(!showModal);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Photos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size-md="6" offset-md="3" className="ion-text-center">
              <IonList>{photoItems}</IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonModal id="img-modal" isOpen={showModal}>
          <IonItem className="ion-align-self-end">
            <IonButton onClick={toggleModalPic}>close</IonButton>
          </IonItem>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{currentFileName}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <img src={currentPhotoUrl} alt="current img" />
            </IonCardContent>
          </IonCard>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Photos;
