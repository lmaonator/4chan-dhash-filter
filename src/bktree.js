import { Hash } from "browser-image-hash";

class Node {
  /** Creates a new node
   *  @param {Hash} hash
   *  @param {number} distance
   */
  constructor(hash, distance) {
    this.hash = hash;
    this.distance = distance;
    /** @type {Node[]} */
    this.children = [];
  }
}

class BKTree {
  /** @type {Node | null} */
  #root = null;

  /** Insert hash into the tree
   *  @param {Hash} hash
   */
  insert(hash) {
    if (this.#root === null) {
      this.#root = new Node(hash, 0);
      return;
    }

    let node = this.#root;
    outer: while (true) {
      const distance = node.hash.getHammingDistance(hash);
      if (distance === 0) {
        return;
      }

      for (const child of node.children) {
        if (child.distance === distance) {
          node = child;
          continue outer;
        }
      }

      node.children.push(new Node(hash, distance));
      return;
    }
  }

  /** Search the tree for a hash within maxDistance
   *  @param {Hash} hash
   *  @param {number} maxDistance
   *  @returns {?{hash:Hash,distance:number}} The found Hash or null
   */
  lookup(hash, maxDistance) {
    if (this.#root === null) {
      return null;
    }

    const queue = [this.#root];
    while (queue.length > 0) {
      const node = queue.pop();

      const distance = node.hash.getHammingDistance(hash);
      if (distance <= maxDistance) {
        return { hash: node.hash, distance };
      }

      const low = distance - maxDistance;
      const high = distance + maxDistance;
      for (const child of node.children) {
        if (low <= child.distance && child.distance <= high) {
          queue.push(child);
        }
      }
    }

    return null;
  }
}

export { BKTree };
