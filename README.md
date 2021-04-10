### IZ\*ONE Private Mail Archive (Node)

### ***Fetch, save, and view all your private mails.***

Latest release: April 10, 2021 <br />
README last updated: April 10, 2021

#### Release logs

4/10/2021
- You can now view all you mails in `index.html`. If you have ran the script before, please delete all your mails in your output folder, and re-reun `npm run start`. 

4/9/2021
- Removed mail subject from the file name of mails. Please delete all your mails in your output folder, and re-run `npm run start`
#### Intro

PM officially announced service will be terminated on May 31, 2021 (JST), and the members will stop sending mail on April 28, 2021 (JST). This script will likely stop working when service is terminated.

This script fetches every single mail you have ever received from the members you are subscribed to, and saves each mail as a static HTML file, which can be viewable indefinitely. All images are downloaded from PM's server, and saved as an image file.

#### Pre-reqs
- npm
- Node.js
- Private Mail user ID (in the app's settings)
- Private Mail acess token
  - Located in the HTTP request header. The header can be captured using a proxy.

#### Steps
1. Clone or download this repo
2. Open `userSettings.js` and fill in your info
3. `npm install`
4. `npm run start` (run this when you want to get the latest mail)
5. View all your mails by opening `index.html` (this file should open in your default browser)

#### Folder structure
`index.html` => A list of all your mails  (viewable in the browser)
<br />
`out/memberKoreanName/` => individual HTML mails 
<br />
`out/memberKoreanName/images` => individual images live here

***Don't modify the file names, as the script uses them to save mails efficiently, and to know if your inbox is updated or not.***

