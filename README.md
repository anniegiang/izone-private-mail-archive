### IZ\*ONE Private Mail Archive (Node)

Last updated: April 8, 2021 <br />
README last updated: April 4, 2021
#### Intro

PM officially announced service will be terminated on May 31, 2021, and the members will stop sending mail on April 28, 2021. This script will likely stop working when service is terminated.

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

#### Folder structure
`out/memberKoreanName/` => all HTML mails (viewable in the browser)
<br />
`out/memberKoreanName/images` => all images live here

***Don't modify the file names, as the script uses them to save mails efficiently, and to know if your inbox is updated or not.***

