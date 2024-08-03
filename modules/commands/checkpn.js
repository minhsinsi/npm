const axios = require('axios');

module.exports.config = {
  name: "checkpn",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Dũngkon",
  description: "Check phạt nguội qua biển số xe",
  commandCategory: "Tiện ích",
  usages: "bsx",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  try {
    if (args.length === 0) {
      return api.sendMessage("Thiếu Biển Số Xe.", event.threadID, event.messageID);
    }

    const bienso = args.join(" ");
    const apidk = `https://api.sumiproject.net/checkpn?bienso=${bienso}`;

    api.setMessageReaction("⌛", event.messageID, () => { }, true);
    api.sendMessage("Đang Tiến Hành Check Phạt Nguội ...!", event.threadID, event.messageID);

    const response = await axios.get(apidk);
    const { status, data, data_info } = response.data;

    if (status === 2 && data === null) {
      return api.sendMessage("Không có vi phạm cho biển số xe này.", event.threadID, event.messageID);
    }

    let message = `Biển số: ${bienso}\nThông tin vi phạm:\n`;

    data.forEach(vehicle => {
      const {
        "Biển kiểm soát": bks,
        "Màu biển": mau,
        "Loại phương tiện": loai,
        "Thời gian vi phạm": thoigianvipham,
        "Địa điểm vi phạm": diadiem,
        "Hành vi vi phạm": hanhvi,
        "Trạng thái": tt,
        "Đơn vị phát hiện vi phạm": donviphathien,
        "Nơi giải quyết vụ việc": noigiaiquyet
      } = vehicle;

      message += `Biển kiểm soát: ${bks}\n`;
      message += `Màu biển: ${mau}\n`;
      message += `Loại phương tiện: ${loai}\n`;
      message += `Thời gian vi phạm: ${thoigianvipham}\n`;
      message += `Địa điểm vi phạm: ${diadiem}\n`;
      message += `Hành vi vi phạm: ${hanhvi}\n`;
      message += `Trạng thái: ${tt}\n`;
      message += `Đơn vị phát hiện vi phạm: ${donviphathien}\n`;
      message += `Nơi giải quyết vụ việc:\n${noigiaiquyet.join("\n")}\n`;
      message += `----------------------\n`;
    });

    message += `Tổng số vi phạm: ${data_info.total}\n`;
    message += `Chưa xử phạt: ${data_info.chuaxuphat}\n`;
    message += `Đã xử phạt: ${data_info.daxuphat}\n`;
    message += `Cập nhập mới nhất từ: ${data_info.latest}\n`;

    api.setMessageReaction("✅", event.messageID, () => { }, true);

    api.sendMessage(message, event.threadID, (e) => {
      if (e) {
        api.setMessageReaction("❌", event.messageID, () => { }, true);
        api.sendMessage("Xảy ra lỗi: " + e, event.threadID, event.messageID);
      }
    });
  } catch (error) {
    api.setMessageReaction("❌", event.messageID, () => { }, true);
    api.sendMessage("Đã xảy ra lỗi: " + error.message, event.threadID, event.messageID);
  }
};