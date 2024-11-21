const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel } = require('docx');

// Tạo báo cáo từ JSON
const generateReportFromJson = async (data, fileName) => {
    const document = new Document();

    const addCategoryToReport = (category, level = HeadingLevel.HEADING_1) => {
        document.addSection({
            children: [
                new Paragraph({ text: category.category, heading: level }),
            ],
        });

        category.tasks?.forEach((task) => {
            document.addSection({
                children: [
                    new Paragraph({
                        text: `- Task: ${task.task}`,
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph(`Combine: ${task.combine}`),
                    new Paragraph(`Scored: ${task.scored ? "Yes" : "No"}`),
                    new Paragraph(`Remediation: ${task.remediation || "N/A"}`),
                    new Paragraph(`Note: ${task.note || "N/A"}`),
                ],
            });

            task.commands?.forEach((command) => {
                const result = evaluateCommandOutput(
                    command.output,
                    command.expected_output,
                    command.operator
                );
                document.addSection({
                    children: [
                        new Paragraph(`Command: ${command.command}`),
                        new Paragraph(`Expected Output: ${command.expected_output}`),
                        new Paragraph(`Operator: ${command.operator}`),
                        new Paragraph(`Parser: ${command.parser || "N/A"}`),
                        new Paragraph(`Output: ${command.output || "Not available"}`),
                        new Paragraph(`Result: ${result ? "PASS" : "FAIL"}`),
                    ],
                });
            });
        });

        category.children?.forEach((child) => addCategoryToReport(child, level + 1));
    };

    addCategoryToReport(data);

    const reportDir = path.resolve(__dirname, '../../agent/report');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, fileName);
    const buffer = await Packer.toBuffer(document);
    fs.writeFileSync(reportPath, buffer);
    console.log(`Report saved at: ${reportPath}`);
};

// Đánh giá kết quả lệnh
const evaluateCommandOutput = (output, expectedOutput, operator) => {
    try {
        switch (operator) {
            case "Equal":
                return output === expectedOutput;
            case "Contain":
                return output.includes(expectedOutput);
            case "Notcontain":
                return !output.includes(expectedOutput);
            case "Includeoneof":
                return expectedOutput.split(",").some((item) => output.includes(item));
            case "Allin":
                return expectedOutput.split(",").every((item) => output.includes(item));
            case "Notequal":
                return output !== expectedOutput;
            case "Regex":
                return new RegExp(expectedOutput).test(output);
            case "GreaterThan":
                return parseFloat(output) > parseFloat(expectedOutput);
            case "GreaterThanOrEqual":
                return parseFloat(output) >= parseFloat(expectedOutput);
            case "LessThan":
                return parseFloat(output) < parseFloat(expectedOutput);
            case "LessThanOrEqual":
                return parseFloat(output) <= parseFloat(expectedOutput);
            case "Between":
                const [minVal, maxVal] = expectedOutput.split(",").map(parseFloat);
                return parseFloat(output) >= minVal && parseFloat(output) <= maxVal;
            default:
                return false;
        }
    } catch (error) {
        console.error('Error evaluating command output:', error.message);
        return false;
    }
};

module.exports = { generateReportFromJson, evaluateCommandOutput };
