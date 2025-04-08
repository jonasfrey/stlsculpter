const apiToken = "NEW_TOKEN_OR_EMPTY"; // Replace with your token
const modelPath = "./vase_honey_pot3.stl";

// 1. Prepare metadata (matches browser payload)
const payload = {
  name: "Vase - Honey Pot 3",
  description: "A 3D-printable vase with mathematical influences.",
  tags: ["vase", "vasemode", "3dprint", "base", "art", "mathematics"],
  categories: ["e56c5de1e9344241909de76c5886f551"], // UUID for "Art" category
  license: "322a749bcfa841b29dff1e8a1bb74b0b",     // UUID for CC Attribution
  isPublished: true,
  isDownloadable: true,
  visibility: "public",
  downloadType: "free",
};

// 2. Read file and create FormData
const fileContent = await Deno.readFile(modelPath);
const formData = new FormData();
formData.append("modelFile", new Blob([fileContent]), "vase_honey_pot.stl");

// 3. Append metadata as JSON (Sketchfab expects multipart + JSON)
formData.append("source", "api");
formData.append("data", JSON.stringify(payload));

// 4. Upload
const response = await fetch("https://api.sketchfab.com/v3/models", {
  method: "POST",
  headers: {
    "Authorization": `Token ${apiToken}`,
  },
  body: formData,
});

if (response.ok) {
  const data = await response.json();
  console.log("✅ Upload success! Model URL:", data.uri);
} else {
  console.error("❌ Upload failed:", await response.text());
}