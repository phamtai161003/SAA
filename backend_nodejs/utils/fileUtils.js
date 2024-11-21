const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

// Tạo file JSON cho Category gốc
exports.generateCategoryFile = async (category) => {
    try {
        if (!category.parentId) { // Chỉ xử lý với category gốc
            const filename = `${slugify(category.name, { lower: true })}.json`;
            const filepath = path.join(__dirname, '../../agent/command', filename);

            const data = await this.generateCategoryHierarchy(category);
            fs.writeFileSync(filepath, JSON.stringify(data, null, 4), 'utf-8');
            console.log(`JSON file created: ${filepath}`);
        }
    } catch (error) {
        console.error('Error generating category file:', error.message);
    }
};

// Tạo cấu trúc phân cấp Category, Task, Command
exports.generateCategoryHierarchy = async (category) => {
    try {
        const tasks = await category.getTasks();
        const children = await category.getChildren();

        return {
            category: category.name,
            slug: category.slug,
            command: category.cmd || 'No command',
            expected_output: category.expect_output || 'No expected output',
            tasks: await Promise.all(tasks.map(async (task) => ({
                task: task.name,
                slug: task.slug,
                combine: task.combine,
                scored: task.scored,
                remediation: task.remediation || 'No remediation',
                note: task.note || 'No note',
                commands: await task.getCommands().then((commands) =>
                    commands.map((cmd) => ({
                        operator: cmd.operator,
                        cmd: cmd.cmd,
                        expect: cmd.expect,
                        parser: cmd.parser || 'No parser',
                    }))
                ),
            }))),
            children: await Promise.all(children.map(this.generateCategoryHierarchy)),
        };
    } catch (error) {
        console.error('Error generating category hierarchy:', error.message);
        return {};
    }
};

// Xóa file JSON của category
exports.deleteCategoryFile = (category) => {
    try {
        if (!category.parentId) {
            const filename = `${slugify(category.name, { lower: true })}.json`;
            const filepath = path.join(__dirname, '../../agent/command', filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                console.log(`Deleted file: ${filepath}`);
            } else {
                console.warn(`File not found: ${filepath}`);
            }
        }
    } catch (error) {
        console.error('Error deleting category file:', error.message);
    }
};
