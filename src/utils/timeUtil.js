let time = new Date().getHours() + new Date().getMinutes() / 60;
  let openTimePercentage = 0;
  if (time >= 11 && time <= 22) openTimePercentage = time - 11;
  else if (time > 22) openTimePercentage = 11;
  openTimePercentage /= 11;