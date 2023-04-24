// import { send } from 'process';
// const accountSid = "ACff95446d14621e5936f6ea4c16739955"
// const authToken ="751d67e2b9bfbfd93e49d707a794802c"
// const verifySid = "VA5137e138f3069f8cb7414d3f7f70b773";
// const phoneNumber = "+84796793834";
// // async function sendSMS(to: string, message: string) {
// //   const from = phoneNumber;
// //   client.messages.create({ body: message, from, to })
// //     .then((message) => console.log(`SMS sent successfully to ${to}. Message SID: ${message.sid}`))
// //     .catch((error) => console.log(`Error sending SMS to ${to}: ${error.message}`));
// // }
// // // Example usage:
// // sendSMS('+84367842734', '0')
// async function sendOTP(toNumber:string, message:string) {
//     client.verify.v2
//     .services(verifySid)
//     .verifications.create({ to: toNumber, channel: "sms" })
//     .then((verification) => console.log(verification.status));
// }
// export {sendOTP}
