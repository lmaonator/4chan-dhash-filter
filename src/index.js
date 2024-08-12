import { BKTree } from "./bktree";
import { DifferenceHashBuilder, Hash } from "browser-image-hash";

(async () => {
  const hammingDistance = 5;
  const styleFilter = "blur(5px) grayscale(0.6)";

  /** Get hash list
   * @returns {Promise<string[]>}
   */
  async function getHashList() {
    return JSON.parse(await GM_getValue("hash_list", "[]"));
  }

  /** Save hash list
   * @param {string[]} hashList
   */
  function saveHashList(hashList) {
    GM_setValue("hash_list", JSON.stringify(hashList));
  }

  /** Build BKTree with all hashes
   *  @param {string[]} hashList
   */
  async function buildTree(hashList) {
    const tree = new BKTree();
    for (const rawHash of hashList) {
      const hash = new Hash(rawHash);
      tree.insert(hash);
    }
    return tree;
  }

  let tree = await buildTree(await getHashList());

  /** Adds or removes hash from list
   *  @param {Hash} hash
   *  @eturns {Promise<boolean>} True if the hash was added, false if removed
   */
  async function updateHashList(hash) {
    let hashList = await getHashList();
    let added;
    const oldLength = hashList.length;
    hashList = hashList.filter((item) => item !== hash.rawHash);
    if (hashList.length < oldLength) {
      // removed
      added = false;
    } else {
      // add
      hashList.push(hash.rawHash);
      added = true;
    }
    saveHashList(hashList);
    tree = await buildTree(hashList);
    return added;
  }

  async function blobRequest(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: url,
        responseType: "blob",
        onload: (resp) => {
          resolve(resp.response);
        },
        onerror: (error) => {
          reject(error);
        },
      });
    });
  }

  const builder = new DifferenceHashBuilder();

  async function filter(post) {
    try {
      const imgLink = post.querySelector("a.fileThumb");
      if (imgLink === null) return;

      const src = imgLink.href.replace(".jpg", "s.jpg");

      let hash;
      const cachedHash = sessionStorage.getItem(src);
      if (cachedHash !== null) {
        hash = new Hash(cachedHash);
      } else {
        // using src directly taints the builder canvas with cross-origin data
        const blob = await blobRequest(src);
        const url = window.URL.createObjectURL(blob);
        hash = await builder.build(url);
        console.log("Hashed thumbnail", src, hash.toString());
        sessionStorage.setItem(src, hash.rawHash);
      }

      const found = tree.lookup(hash, hammingDistance);
      if (found !== null) {
        console.log(
          `filtering image based on dHash, hamming distance ${found.distance}, url ${src}, dhash ${hash.toString()}, filter entry dhash ${found.hash.toString()}`,
        );
        imgLink.style.filter = styleFilter;
      }

      post.addEventListener("click", async (e) => {
        if (e.ctrlKey && e.altKey) {
          e.preventDefault();
          if (await updateHashList(hash)) {
            alert(`Added image to filter list\ndHash: ${hash.toString()}`);
            imgLink.style.filter = styleFilter;
          } else {
            alert(`Removed image from filter list\ndHash: ${hash.toString()}`);
            imgLink.style.filter = "";
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  const thread = document.querySelector(".thread");

  const obs = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (
          node.tagName === "DIV" &&
          node.classList.contains("postContainer")
        ) {
          filter(node);
        }
      }
    }
  });

  obs.observe(thread, { childList: true });

  for (const post of thread.querySelectorAll("div.postContainer")) {
    filter(post);
  }
})();
