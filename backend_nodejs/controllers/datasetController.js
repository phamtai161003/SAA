const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const { DateTime } = require('luxon');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

/**
 * API tải file dataset đã mã hóa
 */
exports.downloadDataset = async (req, res) => {
    try {
        const user = req.user;

        // Kiểm tra xác thực người dùng
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const cryptoKey = user.crypto_key;
        if (!cryptoKey) {
            return res.status(400).json({ error: 'User does not have a crypto key' });
        }

        const categorySlug = req.query.category;
        const activationDays = parseInt(req.query.activation_days || '1', 10);

        if (!categorySlug) {
            return res.status(400).json({ error: 'Category is required' });
        }

        // Đường dẫn file dataset
        const filePath = path.resolve(
            `C:/Users/phamd/OneDrive/Đồ án SAA/SAA/agent/command/${categorySlug}.json`
        );
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Tạo khóa mã hóa từ crypto_key của người dùng
        const key = cryptoKey.padEnd(32, '0').slice(0, 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), Buffer.alloc(16, 0));

        // Tạo ngày hết hạn
        const expirationDate = DateTime.now().plus({ days: activationDays }).toFormat('yyyy-MM-dd');

        // Đọc và mã hóa file
        const fileData = await readFile(filePath, 'utf-8');
        const dataToEncrypt = `${expirationDate}\n${fileData}`;
        const encryptedData = Buffer.concat([cipher.update(dataToEncrypt, 'utf8'), cipher.final()]);

        // Ghi file mã hóa tạm thời
        const encryptedFilePath = path.resolve(
            `C:/Users/phamd/OneDrive/Đồ án SAA/SAA/agent/command/${categorySlug}.encrypted`
        );
        await writeFile(encryptedFilePath, encryptedData);

        // Gửi file đến người dùng
        res.download(encryptedFilePath, `${categorySlug}.encrypted`, async (err) => {
            if (!err) {
                // Xóa file tạm sau khi gửi xong
                try {
                    await unlink(encryptedFilePath);
                } catch (error) {
                    console.error(`Failed to delete temporary file: ${error.message}`);
                }
            }
        });
    } catch (error) {
        console.error('Error processing file:', error.message);
        res.status(500).json({ error: 'Error processing file' });
    }
};
