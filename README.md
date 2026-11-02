# React Spreadsheet

A basic spreadsheet application made using React. It works similar to a simple Excel sheet, where you can enter data, make changes, and manage your cells easily

### Features

The app starts with a 10x10 grid, and you can edit any cell. You can add more rows and columns whenever needed. It supports SUM and AVERAGE calculations, lets you make text bold or add background colors to cells, and you can copy and paste multiple cells at once. You can also save your spreadsheet as a JSON file and open it again whenever you need it

### Getting Started

Make sure Node.js (version 18 or above) is installed on your system

Run the following commands


npm install
npm start


Once the app starts, open http://localhost:3000 in your browser.

To create a production build, run:


npm run build


The production files will be available in the `build` folder.

### How to Use

#### Editing cells

Click on any cell and start entering data. You can also double-click a cell to edit its existing content. Press Enter to save your changes or Escape to cancel. Use the arrow keys to move between cells.

#### Selecting cells

You can select multiple cells by dragging your mouse, holding Shift while clicking, or using Shift + arrow keys.

#### Calculations

You can perform basic calculations directly inside cells. Start with `=` and enter a formula. For example, `=SUM(A1:A5)` adds the values from A1 to A5, `=AVERAGE(B1:B3)` calculates the average of B1 to B3, and `=SUM(A1, B2, 10)` adds individual cell values and numbers.

Empty cells and text values are ignored during calculations.

#### Formatting

Select the cells you want to format and click the B button to make the text bold. You can also use Ctrl+B.

To change the cell background, use the Fill color option. If you want to remove the color, simply select No Fill.

#### Copy and Paste

Select the cells you want to copy and click Copy or press Ctrl+C. Then select the destination cell and click Paste or press Ctrl+V.

You can also paste data outside the existing grid. The spreadsheet will automatically add more rows or columns when needed.

#### Saving and Loading

You don't have to worry about losing your work when you close the application.

Click Save JSON to download your spreadsheet as `spreadsheet.json`, and click Load JSON to open a previously saved spreadsheet.

Your saved file contains the cell values, formatting, and spreadsheet size, so you can continue working from where you left off
