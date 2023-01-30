import useSWRImmutable from "swr/immutable";

export const useIPFSQuery = (ipfsPath?: string) => {
  return useSWRImmutable(
    () => (ipfsPath !== undefined ? ipfsPath : false),
    async () => {
      if (ipfsPath) {
        return fetch(`https://ipfs.kleros.io${ipfsPath}`).then((res) =>
          res.json()
        );
      } else throw Error;
    }
  );
};
