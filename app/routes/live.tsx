import React from 'react';


/**
 * 直播间页面，内嵌静态html，通过cookie传递加密后的url数据
 *
 * @export
 * @return {*}
 */
export default function livePage() {
  return (
    <iframe src="../live.html"></iframe>
  );
}
