  // get the first letters from the user name to display the pfp error widget
  export default function getUserNameFirstLettersForErrorWidget(userName){
    // split the name to parts
    const userNameParts = userName.split(" ")
    const maxPartsLength = userNameParts.length > 2 ? 2 : userNameParts.length // max the display on two letters to evade problems 
    // store final result
    let finalResult = ""
    // loop through all parts and get the first letter max of two 
    for (let index = 0; index < maxPartsLength; index++) {
      finalResult = finalResult + userNameParts[index][0]
    }
    return finalResult
  }