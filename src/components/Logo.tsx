import React from "react";

interface LogoProps {
  size?: "small" | "medium" | "large";
}

const CustomLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.4783 2.3111H13.0994C12.5413 2.3111 12.0889 2.94785 12.0889 3.73332V7.28887C12.0889 8.07435 12.5413 8.7111 13.0994 8.7111H17.4783C18.0364 8.7111 18.4889 8.07435 18.4889 7.28887V3.73332C18.4889 2.94785 18.0364 2.3111 17.4783 2.3111Z"
      fill="#0969DA"
    />
    <path
      d="M7.87824 2.3111H3.4993C2.9412 2.3111 2.48877 2.94785 2.48877 3.73332V7.28887C2.48877 8.07435 2.9412 8.7111 3.4993 8.7111H7.87824C8.43634 8.7111 8.88877 8.07435 8.88877 7.28887V3.73332C8.88877 2.94785 8.43634 2.3111 7.87824 2.3111Z"
      fill="#0969DA"
    />
    <path
      d="M27.0784 2.3111H22.6995C22.1414 2.3111 21.689 2.94785 21.689 3.73332V7.28887C21.689 8.07435 22.1414 8.7111 22.6995 8.7111H27.0784C27.6365 8.7111 28.089 8.07435 28.089 7.28887V3.73332C28.089 2.94785 27.6365 2.3111 27.0784 2.3111Z"
      fill="#0969DA"
    />
    <path
      d="M27.0784 11.9111H22.6995C22.1414 11.9111 21.689 12.5479 21.689 13.3334V16.8889C21.689 17.6744 22.1414 18.3111 22.6995 18.3111H27.0784C27.6365 18.3111 28.089 17.6744 28.089 16.8889V13.3334C28.089 12.5479 27.6365 11.9111 27.0784 11.9111Z"
      fill="#0969DA"
    />
    <path
      d="M17.4783 11.9111H13.0994C12.5413 11.9111 12.0889 12.5479 12.0889 13.3334V16.8889C12.0889 17.6744 12.5413 18.3111 13.0994 18.3111H17.4783C18.0364 18.3111 18.4889 17.6744 18.4889 16.8889V13.3334C18.4889 12.5479 18.0364 11.9111 17.4783 11.9111Z"
      fill="#0969DA"
    />
    <path
      d="M17.4783 21.6889H13.0994C12.5413 21.6889 12.0889 22.3257 12.0889 23.1111V26.6667C12.0889 27.4522 12.5413 28.0889 13.0994 28.0889H17.4783C18.0364 28.0889 18.4889 27.4522 18.4889 26.6667V23.1111C18.4889 22.3257 18.0364 21.6889 17.4783 21.6889Z"
      fill="#0969DA"
    />
  </svg>
);

const Logo: React.FC<LogoProps> = ({ size = "medium" }) => {
  const sizeConfig = {
    small: { iconSize: 24, fontSize: "18px", gap: "2px" },
    medium: { iconSize: 28, fontSize: "22px", gap: "4px" },
    large: { iconSize: 32, fontSize: "24px", gap: "8px" },
  };

  const { iconSize, fontSize, gap } = sizeConfig[size];

  return (
    <div
      role="banner"
      aria-label="TaskFlowアプリケーションロゴ"
      style={{ gap }}
      className={`flex items-end select-none`}
    >
      <div className="flex items-center">
        <CustomLogo size={iconSize} />
      </div>
      <h1
        style={{
          color: "var(--foreground)",
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
          fontSize: `${fontSize}`
        }}
        className="font-semibold m-0 leading-[condensed] translate-[0 -2px]"
      >
        Task<span style={{ color: "var(--primary)" }}>Flow</span>
      </h1>
    </div>
  );
};

export default Logo;
