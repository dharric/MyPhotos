import React, { useCallback, useEffect } from 'react';
import { CameraResultType } from '@capacitor/core';
import { useCamera, availableFeatures } from '@ionic/react-hooks/camera';
import { IonButton, IonContent, IonHeader, IonToolbar, IonTitle, IonPage, IonText } from '@ionic/react';

const Camera: React.FC = () => {
    const { photo, getPhoto } = useCamera();
    const triggerCamera = useCallback(async () => {
        if(availableFeatures.getPhoto) {
            await getPhoto({
                quality: 100,
                allowEditing: false,
                resultType: CameraResultType.Uri
            });
        }
    }, [getPhoto]);

    useEffect(() => {
        console.log('photo', photo);
    }, [photo]);

    const onClick = () => {
        triggerCamera();        
    }

    if(availableFeatures.getPhoto) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Camera</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {photo && <img src={photo.webPath} alt="my pic" />}
                    <IonButton onClick={onClick}>
                        camera
                    </IonButton>
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
}

export default Camera;