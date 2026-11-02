/**
 * ===================================================================
 * สคริปต์ Google Apps Script สำหรับระบบเช็คชื่อด้วยใบหน้า
 * ===================================================================
 * วิธีติดตั้ง:
 * 1. เปิด Google Sheets เปล่าขึ้นมา 1 ไฟล์
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมออกทั้งหมด แล้ววางโค้ดชุดนี้ลงไป
 * 4. กดปุ่ม "บันทึก" (รูปแผ่นดิสก์)
 * 5. กดปุ่ม "การทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้ใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอป" (Web app)
 *    - คำอธิบาย: ระบบเช็คชื่อ
 *    - ดำเนินการในฐานะ: "ฉัน" (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: "ทุกคน" (Anyone)  <--- สำคัญมาก ต้องเลือกทุกคน
 * 7. กด "ทำให้ใช้งานได้" (Deploy) แล้วคัดลอก "URL ของเว็บแอป" (Web App URL)
 *    มาใส่ในช่องตั้งค่า Google Sheet URL บนหน้าเว็บ
 * ===================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = getOrCreateSheet("บันทึกการเช็คชื่อ");
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    if (data.action === "checkin") {
      var timestamp = new Date();
      var dateStr = Utilities.formatDate(timestamp, "Asia/Bangkok", "yyyy-MM-dd");
      var timeStr = Utilities.formatDate(timestamp, "Asia/Bangkok", "HH:mm:ss");
      
      // เพิ่มแถวใหม่ [วัน-เวลา, วันที่, เวลา, ชื่อ-สกุล, หมายเหตุ]
      sheet.appendRow([timestamp, dateStr, timeStr, data.name, data.note || "เช็คชื่อผ่านใบหน้า"]);

      return responseJSON({
        status: "success",
        message: "บันทึกข้อมูลเรียบร้อย",
        name: data.name,
        date: dateStr,
        time: timeStr
      });
    }

    return responseJSON({ status: "error", message: "Unknown action" });
  } catch (error) {
    return responseJSON({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var sheet = getOrCreateSheet("บันทึกการเช็คชื่อ");
    var data = sheet.getDataRange().getValues();
    
    // แปลงข้อมูลเป็น JSON เพื่อส่งกลับให้แดชบอร์ดดูได้
    var records = [];
    var todayStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd");
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      records.push({
        timestamp: row[0],
        date: row[1],
        time: row[2],
        name: row[3],
        note: row[4]
      });
    }

    return responseJSON({
      status: "success",
      today: todayStr,
      totalRecords: records.length,
      records: records
    });
  } catch (error) {
    return responseJSON({ status: "error", message: error.toString() });
  }
}

function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // สร้างหัวตาราง (Header)
    var headers = ["วันและเวลาประทับ", "วันที่", "เวลา", "ชื่อ-นามสกุล", "สถานะ"];
    sheet.appendRow(headers);
    
    // จัดรูปแบบหัวตาราง
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4F46E5");
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
