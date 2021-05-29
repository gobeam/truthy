export class GenerateCodeHelper {
  /**
   * generate random string code providing length
   * @param length
   * @param uppercase
   * @param lowercase
   * @param numerical
   */
  generateRandomCode(
    length: number,
    uppercase = true,
    lowercase = true,
    numerical = true
  ): string {
    let result = '';
    const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericalLetters = '0123456789';
    let characters = '';
    if (uppercase) {
      characters += upperCaseAlphabets;
    }
    if (lowercase) {
      characters += lowerCaseAlphabets;
    }
    if (numerical) {
      characters += numericalLetters;
    }
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
