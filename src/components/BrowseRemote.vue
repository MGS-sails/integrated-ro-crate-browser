<script setup lang="ts">
import { ref, computed } from "vue";
// import { ROCrateZipExplorer, type ROCrateZip } from "ro-crate-zip-explorer";
import { ROCrateZipExplorer, type ROCrateZip } from "../../../../../src";
import Explorer from "./Explorer.vue";
import RoCrateBrower from "../../../../../../vue-ro-crate-browser/src/components/RoCrateBrowser.vue";
import axios from "axios";

const url = ref<string>(
  "https://raw.githubusercontent.com/davelopez/ro-crate-zip-explorer/refs/heads/main/tests/test-data/simple-invocation.rocrate.zip",
);
const roCrateZipFile = ref<ROCrateZip>();

const canExploreRemote = computed(() => {
  try {
    new URL(url.value);
    return true;
  } catch {
    return false;
  }
});

const exploreTooltip = computed(() => {
  if (canExploreRemote.value) {
    return "";
  } else {
    return "Please enter a valid URL";
  }
});

async function exploreRemote() {
  console.log("URL", url.value);
  const explorer = new ROCrateZipExplorer(url.value);
  roCrateZipFile.value = await explorer.open();
}

const hasRoCratePreview = (array) => {
  return array.some(item => item.filename === "ro-crate-preview.html");
}

const generateHTMLPreview = () => {
  console.log('URL ', url.value);
  axios.post('http://127.0.0.1:5000/process_crate', {
    'url': url.value
  }, {
    responseType: 'blob' // Specify the response type as 'blob' for binary data
  }).then(response => {
    // Create a blob from the response data
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const link = document.createElement('a');

    // Create an object URL for the blob
    link.href = window.URL.createObjectURL(blob);

    // Set the download attribute to specify the file name
    link.download = 'crate.zip'; // Adjust the file name as needed

    // Append the link to the body and trigger a click to download
    document.body.appendChild(link);
    link.click();

    // Clean up by removing the link and revoking the object URL
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }).catch(error => {
    console.error('Error while downloading the file:', error);
    // Handle error accordingly
  });
};

</script>

<template>
  <main>
    <h2>Browse <span class="green">remote</span> RO-Crate Zip files</h2>
    <p>
      <span class="green"><b>Important!</b></span> The server hosting the zip file must acept
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests"
        target="_blank"
        rel="noopener noreferrer"
        >HTTP range requests</a
      >.
    </p>

    <input type="url" v-model="url" placeholder="Enter the URL of the RO-Crate Zip file" required class="url-input" />

    <button :disabled="!canExploreRemote" @click="exploreRemote" class="button" :title="exploreTooltip">Explore</button>


    <div v-if="roCrateZipFile">
      <Explorer :ro-crate-zip-file="roCrateZipFile" />
      <ro-crate-brower
        v-if="hasRoCratePreview(roCrateZipFile.files)"
        :crate-url="url"
      />
      <div v-else>
        <h3>
          This Crate does not have a HTML preview
        </h3>
        <button @click="generateHTMLPreview" class="button">
          Click here to generate a HTML preview
        </button>
      </div>
    </div>

  </main>
</template>

<style scoped>
.url-input {
  width: 90%;
  padding: 0.5rem;
  margin: 1rem 0;
  font-size: 1rem;
}
</style>
