"use client";

import { useState } from "react";
import { Share2, Share, Link, Mail, MessageCircle, Check } from "lucide-react";

interface ShareButtonsProps {
	title: string;
	excerpt?: string;
	url?: string;
}

export default function ShareButtons({
	title,
	excerpt = "",
	url,
}: ShareButtonsProps) {
	const [copied, setCopied] = useState(false);
	const currentUrl =
		url || (typeof window !== "undefined" ? window.location.href : "");

	const shareText = excerpt || title;
	const encodedTitle = encodeURIComponent(title);
	const encodedShareText = encodeURIComponent(shareText);
	const encodedUrl = encodeURIComponent(currentUrl);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(currentUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy link:", err);
		}
	};

	const shareLinks = {
		twitter: `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
		whatsapp: `https://wa.me/?text=${encodedShareText}%20${encodedUrl}`,
		email: `mailto:?subject=${encodedTitle}&body=${encodedShareText}%0A%0A${encodedUrl}`,
	};

	const shares = [
		{
			name: "Facebook",
			href: shareLinks.facebook,
			icon: Share,
			className: "share-facebook",
		},
		{
			name: "LinkedIn",
			href: shareLinks.linkedin,
			icon: Link,
			className: "share-linkedin",
		},
		{
			name: "WhatsApp",
			href: shareLinks.whatsapp,
			icon: MessageCircle,
			className: "share-whatsapp",
		},
		{
			name: "Email",
			href: shareLinks.email,
			icon: Mail,
			className: "share-email",
		},
	];

	return (
		<div className="share-buttons-wrapper">
			<div className="share-buttons-container">
				<div className="share-buttons-header">
					<div className="share-header-content">
						<Share2 size={20} className="share-header-icon" />
						<div>
							<h3 className="share-title">Share this article</h3>
							<p className="share-subtitle">
								Help others discover this content
							</p>
						</div>
					</div>
				</div>

				<div className="share-buttons-grid">
					{shares.map((share) => {
						const Icon = share.icon;
						return (
							<a
								key={share.name}
								href={share.href}
								target="_blank"
								rel="noopener noreferrer"
								className={`share-button ${share.className}`}
								title={`Share on ${share.name}`}
								aria-label={`Share on ${share.name}`}>
								<div className="share-button-content">
									<Icon size={18} className="share-icon" />
									<span className="share-text">{share.name}</span>
								</div>
								<div className="share-button-bg" />
							</a>
						);
					})}

					<button
						onClick={handleCopyLink}
						className={`share-button share-copy ${copied ? "copied" : ""}`}
						title="Copy link to clipboard"
						aria-label="Copy link to clipboard">
						<div className="share-button-content">
							{copied ? (
								<>
									<Check size={18} className="share-icon" />
									<span className="share-text">Copied!</span>
								</>
							) : (
								<>
									<Share2 size={18} className="share-icon" />
									<span className="share-text">Copy Link</span>
								</>
							)}
						</div>
						<div className="share-button-bg" />
					</button>
				</div>
			</div>
		</div>
	);
}
