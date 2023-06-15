/* eslint-disable no-undef */
/**
 * 将原始的二进制数据转换为 Hex String
 * @param bf 待转换的原始数据
 * @param upper 是否需要转换为大写
 * @returns
 */
export function bufferToHex(bf: ArrayBuffer | Uint8Array, upper = false) {
  const u8Array = bf instanceof Uint8Array ? bf : new Uint8Array(bf);
  const hashArray = Array.from(u8Array);
  return hashArray
    .map((b) => {
      let hx = b.toString(16).padStart(2, '0');
      return upper === true ? hx.toUpperCase() : hx;
    })
    .join('');
}

/**
 * 将16进制的数据转换为 UInt8Array
 * @param data 16进制的数据
 * @returns
 */
function hexToBuffer(data: string) {
  const len = data.length / 2;
  const uint8Array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const byteHex = data.substring(i * 2, i * 2 + 2);
    const byte = parseInt(byteHex.toLocaleLowerCase(), 16);
    uint8Array[i] = byte;
  }
  return uint8Array;
}

/**
 * 将原始数据转换为 Base64 编码
 * @param bf 待转换的原始数据
 * @returns
 */
function bufferToBase64(bf: ArrayBuffer | Uint8Array) {
  const u8Array = bf instanceof Uint8Array ? bf : new Uint8Array(bf);
  const hashArray = Array.from(u8Array);
  return window.btoa(String.fromCharCode.apply(null, hashArray));
}

/**
 * 将 Base64 转换为 UInt8Array 数据
 * @param data
 * @returns
 */
function base64ToBuffer(data: string) {
  return new Uint8Array(
    window
      .atob(data)
      .split('')
      .map((char) => char.charCodeAt(0)),
  );
}

/**
 * SHA 哈希算法
 * @param message     待进行 hash 的数据
 * @param upper       是否转换为大写, 默认为: false
 * @param algorithm   hash算法, 支持: SHA-1、SHA-256、SHA-384、SHA-512; 默认为: SHA-256
 * @returns
 */
export async function sha(message: string, upper = false, algorithm = 'SHA-256') {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest(algorithm || 'SHA-256', msgUint8);
  return bufferToHex(hashBuffer, upper);
}

/** 使用的算法名称 */
type AlgorithmNameStr = 'aes' | 'AES' | 'AES-CBC' | 'aes-cbc' | 'rsa' | 'rsa-oaep' | 'RSA' | 'RSA-OAEP';

/** 算法参数 */
// eslint-disable-next-line no-undef
type AlgorithmParam = AlgorithmIdentifier | RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams;

/** 返回结果类似 */
type AlgorithmResType = 'hex' | 'hexUpper' | 'base64' | 'raw';

function parseRsaKey(pem: string) {
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  if (pem.indexOf(pemHeader) !== -1 && pem.indexOf(pemFooter) !== -1) {
    pem = pem.substring(pemHeader.length, pem.indexOf(pemFooter)).trim();
  }
  return pem;
}
/**
 * 导入上下文密钥
 * @param key           导入的密钥
 * @param algorithmName 算法名称
 * @param usages        该密钥可以用于哪些函数使用
 * @returns
 */
// eslint-disable-next-line no-undef
async function importKey(
  key: string,
  algorithmName: AlgorithmNameStr | null,
  usages: KeyUsage[] | null,
  encoding: 'hex' | 'base64' = 'hex',
) {
  let name = 'AES-CBC';
  if (algorithmName == null) {
    name = 'AES-CBC';
  } else {
    if (algorithmName.toUpperCase() === 'AES') {
      name = 'AES-CBC';
    } else if (algorithmName.toUpperCase() === 'RSA') {
      name = 'RSA-OAEP';
    }
  }
  name = name.toUpperCase();
  if (usages == null || usages.length === 0) {
    usages = ['encrypt'];
  }
  let format: 'raw' | 'spki' = 'raw';
  let algorithm: any = { name };
  if (name.includes('RSA')) {
    format = 'spki';
    algorithm.hash = { name: 'SHA-256' };
    key = parseRsaKey(key);
  }
  const keyBuf = encoding === 'base64' ? base64ToBuffer(key) : hexToBuffer(key);
  // importKey时传 false 表明该密钥不能被导出
  return Promise.all([
    window.crypto.subtle.importKey(format, keyBuf, algorithm, false, usages),
    Promise.resolve({ name }),
  ]);
}

/**
 * 加密
 * @param algorithm  算法参数, 算法名称、向量等
 * @param key        算法密钥
 * @param message    待加密的数据
 * @param encode     解密后返回数据格式
 * @returns
 */
async function encrypt(algorithm: AlgorithmParam, key: CryptoKey, message: Uint8Array | string, encode = 'hex') {
  if (typeof message === 'string') {
    message = new TextEncoder().encode(message);
  }
  const encrypted = await window.crypto.subtle.encrypt(algorithm, key, message);
  if (encode === 'hex') {
    return bufferToHex(encrypted);
  } else if (encode === 'hexUpper') {
    return bufferToHex(encrypted, true);
  } else if (encode === 'base64') {
    return bufferToBase64(encrypted);
  } else {
    return encrypted;
  }
}

/**
 * 数据解密
 * @param algorithm 解密算法
 * @param key       解密密钥
 * @param message   加密后的数据
 * @returns
 */
async function decrypt(algorithm: AlgorithmParam, key: CryptoKey, message: Uint8Array) {
  const decrypted = await window.crypto.subtle.decrypt(algorithm, key, message);
  return new TextDecoder('utf-8').decode(decrypted);
}

/**
 * AES 加密
 * @param message 待加密的数据
 * @param key 加解密密钥
 * @param encode 加密后的数据转换的形式, hex - 转换为16进制字符串, hexUpper - 转换为16进制且大写, base64 - 转换为 base64 形式
 * @param iv 加解密向量
 * @returns [加密数据,向量]
 */
export async function aesEncrypt(
  message: string,
  key: string,
  encode: AlgorithmResType = 'hex',
  iv: null | Uint8Array | string = null,
): Promise<{ ciphertext: string | ArrayBuffer; iv: string; key: string }> {
  let ciphertext: string | ArrayBuffer = '';
  let resIv = '';
  // 导入密钥
  const [cryptoKey, algorithm] = await importKey(key, 'aes', ['encrypt']);
  if (iv == null) {
    iv = window.crypto.getRandomValues(new Uint8Array(16));
  } else if (typeof iv === 'string') {
    iv = hexToBuffer(iv);
  }
  const encodeData = await encrypt({ ...algorithm, iv }, cryptoKey, message, encode);
  ciphertext = encodeData;
  resIv = bufferToHex(iv);
  return { ciphertext, iv: resIv, key };
}

/**
 * 根据加密后的数据类型使用对应函数最终转换为 UInt8Array
 * @param message 原始加密后的数据
 * @param type    类型: hex | base64
 * @returns
 */
function parseEncryptData(message: string | Uint8Array, type: string) {
  let input: Uint8Array;
  if (typeof message === 'string') {
    if (type === 'hex' || type === 'hexUpper') {
      input = hexToBuffer(message);
    } else {
      input = base64ToBuffer(message);
    }
  } else {
    input = message;
  }
  return input;
}

/**
 * AES 解密
 * @param message 加密后的数据
 * @param key     解密密钥
 * @param iv      向量
 * @param encode  加密后数据的形式: hex | base64
 * @returns
 */
export async function aesDecrypt(
  message: Uint8Array | string,
  key: string,
  iv: string,
  encode: AlgorithmResType = 'hex',
) {
  // 导入密钥
  const [cryptoKey, algorithm] = await importKey(key, 'aes', ['decrypt']);
  const input = parseEncryptData(message, encode);
  return await decrypt({ ...algorithm, iv: hexToBuffer(iv) }, cryptoKey, input);
}

/**
 * RSA 加密
 * @param key     公钥
 * @param message 待加密数据
 * @param encode  返回类型
 * @returns
 */
export async function rsaEncrypt(message: string, publicKey: string, encode: AlgorithmResType = 'hex') {
  // 导入密钥
  const [cryptoKey, algorithm] = await importKey(publicKey, 'rsa', ['encrypt'], 'base64');
  return await encrypt(algorithm, cryptoKey, message, encode);
}

/**
 * RSA 解密
 * @param key     私钥, 根据私钥解密
 * @param message 加密后的数据
 * @param encode  加密后的数据形式
 * @returns
 */
export async function rsaDecrypt(privateKey: string, message: Uint8Array | string, encode: AlgorithmResType = 'hex') {
  // 导入密钥
  const [cryptoKey, algorithm] = await importKey(privateKey, 'rsa', ['decrypt']);
  return await decrypt({ ...algorithm }, cryptoKey, parseEncryptData(message, encode));
}
