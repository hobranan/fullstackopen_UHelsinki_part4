# fullstackopen_UHelsinki_part4

https://fullstackopen.com/en/part4/structure_of_backend_application_introduction_to_testing

Note: this course material was written with version v20.11.0 of Node.js. Please make sure that your version of Node is at least as new as the version used in the material (you can check the version by running node -v in the command line).

In the exercises for this part, we will be building a blog list application, that allows users to save information about interesting blogs they have stumbled across on the internet. For each listed blog we will save the author, title, URL, and amount of upvotes from users of the application.

npm init
<!-- fill in scripts in package.json -->
<!-- i added the other dependencies from part3 too -->
npm install express
npm install nodemon --save-dev 
npm install morgan
npm install cors
npm install mongoose
npm install dotenv
npm install eslint @eslint/js --save-dev
npm install @stylistic/eslint-plugin-js --save-dev
npm update
npm run dev


ctrl+c
npm install cross-env
npm install supertest --save-dev
npm install express-async-errors