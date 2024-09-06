# Prerequisites
Must have installed the Google Cloud CLI `gcloud`: https://cloud.google.com/sdk/docs/install-sdk


# Steps
1. Go to Google Cloud Console

2. Ensure there is a "Bucket" created. Go to https://console.cloud.google.com/storage and find and select "Buckets

3. Run CLI `gcloud firestore export gs://<bucketName>/<arbitraryFolderName>`

4. Ensure to be in `functions` directory of Firebase repository. 

5. Download the Firestore Export to folder in `functions` with the command `gsutil cp -r "gs://<bucketName>/<arbitraryFolderName>" .` 
  - NB: The *dot* (i.e. `"."`) is important to add at the end. O/w the destination is missing.

6. Run Firebase emulator with `firebase emulators:start --import ./<arbitraryFolderName>`



# Reference
See https://medium.com/readytowork-org/importing-data-from-firestore-to-emulator-6bcdb83a861c