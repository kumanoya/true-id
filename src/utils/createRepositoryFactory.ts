import {
  RepositoryFactoryHttp,
} from 'symbol-sdk';

export const createRepositoryFactory = () => {
  const NODE = "https://sym-test-03.opening-line.jp:3001";
  const repo = new RepositoryFactoryHttp(NODE, {
    websocketUrl: NODE.replace('http', 'ws') + '/ws',
    websocketInjected: WebSocket,
  });
  return repo;
}


