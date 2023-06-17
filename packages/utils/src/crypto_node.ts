import {
  createHash,
  createCipheriv,
  randomBytes,
  generateKeyPair,
  createDecipheriv,
  privateDecrypt,
  publicEncrypt,
} from 'node:crypto';

type HashAlgorithmName = 'md5' | 'sha1' | 'sha256';

/**
 * 进行 md5|sha1|sha256 数据摘要签名
 * @param d 待加密的数据
 * @param algorithm 签名算法, md5、sha1. Defaults to "md5".
 * @param upper 返回的结果是否需要大写. Defaults to False.
 */
export function hashDigest(d: string, algorithm: HashAlgorithmName = 'sha256', upper = false) {
  const hashed = createHash(algorithm).update(d).digest('hex');
  return upper ? hashed.toUpperCase() : hashed;
}

/**
 * 生成 RSA 签名密钥对
 * @returns: [公钥, 私钥]
 */
export async function keyPair(): Promise<[string, string]> {
  return new Promise((resolve, reject) => {
    generateKeyPair(
      'rsa',
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      },
      (err, publicKey, privateKey) => {
        if (err == null) {
          resolve([publicKey, privateKey]);
        } else {
          reject(err);
        }
      },
    );
  });
}

/**
 * AES 加密
 * @param key   加密密钥
 * @param input 待加密的数据
 * @param upper 是否转换为大写
 * @returns [加密数据, 向量]
 */
export function aesEncrypt(key: string, input: string, upper = false): [string, string] {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encryptedData = cipher.update(input, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  return [upper === true ? encryptedData.toUpperCase() : encryptedData, iv.toString('hex')];
}

/**
 * AES 解密
 * @param input 加密后的数据
 * @param key   密钥
 * @param iv    向量
 * @returns
 */
export function aesDecrypt(input: string, key: string, iv: string): string {
  const cipher = createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decryptedData = cipher.update(input, 'hex', 'utf-8');
  decryptedData += cipher.final('utf-8');
  return decryptedData;
}

/**
 * RSA 公钥加密
 * @param input 待加密字符串
 * @param publicKey 公钥
 * @returns
 */
export function rsaEncrypt(input: string, publicKey: string) {
  return publicEncrypt(
    {
      key: publicKey,
      oaepHash: 'sha256',
    },
    Buffer.from(input),
  ).toString('base64');
}

/**
 * RSA 解密
 * @param encrtypData RSA加密后的数据
 * @param privateKey  私钥
 * @returns
 */
export function rsaDecrypt(encrtypData: string, privateKey: string) {
  return privateDecrypt(
    {
      key: privateKey,
      oaepHash: 'sha256',
    },
    Buffer.from(encrtypData, 'base64'),
  ).toString('utf-8');
}
