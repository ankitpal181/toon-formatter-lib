/**
 * Encryptor Class
 * 
 * Handles encryption and decryption of data using specified algorithms.
 * 
 * Supported Algorithms:
 * - 'aes-256-gcm': Symmetric encryption (Node.js crypto). High security, authenticated encryption.
 * - 'xor': Simple XOR cipher. Low security, good for obfuscation only.
 * - 'base64': Base64 encoding. No security, just encoding.
 */

import crypto from 'crypto';

export class Encryptor {
    /**
     * Creates an Encryptor instance
     * @param {string|Buffer|null} key - Encryption key (required for AES-256-GCM and XOR)
     * @param {string} algorithm - Algorithm to use: 'aes-256-gcm', 'xor', or 'base64'
     * @throws {Error} If key is missing for algorithms that require it
     * @throws {Error} If key is invalid for the selected algorithm
     */
    constructor(key = null, algorithm = 'aes-256-gcm') {
        this.key = key;
        this.algorithm = algorithm.toLowerCase();

        // Validate algorithm
        const validAlgorithms = ['aes-256-gcm', 'xor', 'base64'];
        if (!validAlgorithms.includes(this.algorithm)) {
            throw new Error(`Unsupported algorithm: ${this.algorithm}. Valid options: ${validAlgorithms.join(', ')}`);
        }

        // Validate key for AES-256-GCM
        if (this.algorithm === 'aes-256-gcm') {
            if (!this.key) {
                throw new Error('Key is required for AES-256-GCM encryption.');
            }
            this._validateAesKey();
        }
    }

    /**
     * Generates a random 32-byte (256-bit) key suitable for AES-256-GCM
     * @returns {Buffer} 32-byte random key
     * @example
     * const key = Encryptor.generateKey();
     * console.log(key.length); // 32
     */
    static generateKey() {
        return crypto.randomBytes(32);
    }

    /**
     * Encrypts the provided string data
     * @param {string} data - Data to encrypt (must be a string)
     * @returns {string} Encrypted data
     * @throws {Error} If data is not a string
     * @throws {Error} If encryption fails
     */
    encrypt(data) {
        if (typeof data !== 'string') {
            throw new Error('Data to encrypt must be a string.');
        }

        switch (this.algorithm) {
            case 'aes-256-gcm':
                return this._aesEncrypt(data);
            case 'xor':
                return this._xorEncrypt(data);
            case 'base64':
                return Buffer.from(data, 'utf-8').toString('base64');
            default:
                throw new Error(`Unsupported algorithm: ${this.algorithm}`);
        }
    }

    /**
     * Decrypts the provided encrypted string data
     * @param {string} encryptedData - Data to decrypt (must be a string)
     * @returns {string} Decrypted data
     * @throws {Error} If encryptedData is not a string
     * @throws {Error} If decryption fails
     */
    decrypt(encryptedData) {
        if (typeof encryptedData !== 'string') {
            throw new Error('Data to decrypt must be a string.');
        }

        switch (this.algorithm) {
            case 'aes-256-gcm':
                return this._aesDecrypt(encryptedData);
            case 'xor':
                return this._xorDecrypt(encryptedData);
            case 'base64':
                try {
                    return Buffer.from(encryptedData, 'base64').toString('utf-8');
                } catch (error) {
                    throw new Error(`Invalid Base64 data: ${error.message}`);
                }
            default:
                throw new Error(`Unsupported algorithm: ${this.algorithm}`);
        }
    }

    /**
     * Validates the AES key length (must be 32 bytes for AES-256)
     * @private
     * @throws {Error} If key is not 32 bytes
     */
    _validateAesKey() {
        const keyBuffer = Buffer.isBuffer(this.key) ? this.key : Buffer.from(this.key);
        if (keyBuffer.length !== 32) {
            throw new Error(`AES-256-GCM requires a 32-byte (256-bit) key. Provided key is ${keyBuffer.length} bytes.`);
        }
    }

    /**
     * Encrypts text using AES-256-GCM
     * @private
     * @param {string} text - Text to encrypt
     * @returns {string} Encrypted text in format: iv:authTag:encryptedData (all hex)
     * @throws {Error} If encryption fails
     */
    _aesEncrypt(text) {
        try {
            // Generate random 12-byte IV (96 bits, recommended for GCM)
            const iv = crypto.randomBytes(12);

            // Ensure key is a Buffer
            const keyBuffer = Buffer.isBuffer(this.key) ? this.key : Buffer.from(this.key);

            // Create cipher
            const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

            // Encrypt
            let encrypted = cipher.update(text, 'utf-8', 'hex');
            encrypted += cipher.final('hex');

            // Get authentication tag (16 bytes for GCM)
            const authTag = cipher.getAuthTag();

            // Return format: iv:authTag:encryptedData (all in hex)
            return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
        } catch (error) {
            throw new Error(`AES-256-GCM encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypts text using AES-256-GCM
     * @private
     * @param {string} encryptedText - Encrypted text in format: iv:authTag:encryptedData
     * @returns {string} Decrypted text
     * @throws {Error} If decryption fails or authentication fails
     */
    _aesDecrypt(encryptedText) {
        try {
            // Split the encrypted text
            const parts = encryptedText.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted data format. Expected format: iv:authTag:encryptedData');
            }

            const iv = Buffer.from(parts[0], 'hex');
            const authTag = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];

            // Ensure key is a Buffer
            const keyBuffer = Buffer.isBuffer(this.key) ? this.key : Buffer.from(this.key);

            // Create decipher
            const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
            decipher.setAuthTag(authTag);

            // Decrypt
            let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');

            return decrypted;
        } catch (error) {
            throw new Error(`AES-256-GCM decryption failed: ${error.message}`);
        }
    }

    /**
     * Encrypts text using XOR cipher
     * @private
     * @param {string} text - Text to encrypt
     * @returns {string} Encrypted text as hex string
     * @throws {Error} If key is missing or encryption fails
     */
    _xorEncrypt(text) {
        if (!this.key) {
            throw new Error('Key is required for XOR cipher.');
        }

        try {
            // Convert key and text to buffers
            const keyBuffer = Buffer.isBuffer(this.key) ? this.key : Buffer.from(String(this.key), 'utf-8');
            const textBuffer = Buffer.from(text, 'utf-8');
            const result = Buffer.alloc(textBuffer.length);

            // XOR each byte with corresponding key byte (cycling through key)
            for (let i = 0; i < textBuffer.length; i++) {
                result[i] = textBuffer[i] ^ keyBuffer[i % keyBuffer.length];
            }

            // Return as hex string for safe transport/storage
            return result.toString('hex');
        } catch (error) {
            throw new Error(`XOR encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypts text using XOR cipher
     * @private
     * @param {string} hexText - Encrypted text as hex string
     * @returns {string} Decrypted text
     * @throws {Error} If key is missing, format is invalid, or decryption fails
     */
    _xorDecrypt(hexText) {
        if (!this.key) {
            throw new Error('Key is required for XOR cipher.');
        }

        try {
            // Convert key and encrypted data to buffers
            const keyBuffer = Buffer.isBuffer(this.key) ? this.key : Buffer.from(String(this.key), 'utf-8');
            const encryptedBuffer = Buffer.from(hexText, 'hex');
            const result = Buffer.alloc(encryptedBuffer.length);

            // XOR each byte with corresponding key byte (cycling through key)
            for (let i = 0; i < encryptedBuffer.length; i++) {
                result[i] = encryptedBuffer[i] ^ keyBuffer[i % keyBuffer.length];
            }

            return result.toString('utf-8');
        } catch (error) {
            throw new Error(`XOR decryption failed: ${error.message}`);
        }
    }
}

export default Encryptor;
