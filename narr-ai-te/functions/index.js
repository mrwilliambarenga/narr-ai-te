const functions = require("firebase-functions");
const {OpenAI} = require("openai");

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

exports.generateImage = functions.https.onCall(async (data, context) => {
  // Firebase call authentication
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //       "unauthenticated",
  //       "Request had invalid credentials.",
  //   );
  // }

  // OpenAI API call
  try {
    // Parameters received from frontend
    const imgParam = data.imgParam;
    const selectedThemePrompt = data.selectedThemePrompt;

    // GPT4-Vision API call
    const descResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {type: "text", text: "What's in this image?"},
            {
              type: "image_url",
              image_url: {
                url: `${imgParam}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });
    const description = descResponse.choices[0].message.content;

    // DALL-E API call
    const imgResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt:
        description +
        " Instead of a simple drawing, recreate this in the style of " +
        selectedThemePrompt,
      n: 1,
      size: "1024x1024",
    });
    const imageUrl = imgResponse.data[0].url;
    return {imageUrl: imageUrl};
  } catch (error) {
    console.error("Error generating image:", error);
    throw new functions.https.HttpsError(
        "internal", "Unable to generate image.",
    );
  }
});
