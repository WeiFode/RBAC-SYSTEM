import React from 'react';
import { Image } from 'antd';

interface ContentItem {
    type: 'text' | 'image' | 'imageGroup';
    value?: string;
    url?: string;
    caption?: string;
    images?: string[];
}

interface NewsPreviewProps {
    title: string;
    date: string;
    author: string;
    content: ContentItem[];
}

const ImageWithCaption: React.FC<{
    src: any;
    alt: string;
    caption?: string;
}> = ({ src, alt, caption }) => (
    <div className="mb-8">
        <Image
            src={src}
            alt={alt}
            style={{ maxWidth: '100%', height: '300px', objectFit: 'cover' }}
            className="rounded-lg"
        />
        {caption && (
            <p className="text-base text-gray-500 mt-2 text-center">{caption}</p>
        )}
    </div>
);

const ImageGroup: React.FC<{
    images: string[];
    caption?: string;
}> = ({ images, caption }) => (
    <div className="mb-8">
        <div className="grid grid-cols-2 gap-4 mb-2">
            {images && images.length > 0 ? (
                images.map((img, imgIndex) => (
                    <div key={imgIndex}>
                        <Image
                            src={img}
                            alt={`图片组 ${imgIndex + 1}`}
                            style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                            className="rounded-lg"
                        />
                    </div>
                ))
            ) : null}
        </div>
        {caption && (
            <p className="text-sm text-gray-500 mt-2 text-center">{caption}</p>
        )}
    </div>
);

const NewsPreview: React.FC<NewsPreviewProps> = ({ title, date, author, content }) => {
    const renderContent = (item: ContentItem, index: number) => {
        switch (item.type) {
            case 'text':
                return (
                    <p key={index} className="text-gray-700 mb-6 leading-relaxed text-lg">
                        {item.value}
                    </p>
                );
            case 'image':
                return (
                    <ImageWithCaption
                        key={index}
                        src={item.url!}
                        alt={item.caption || '新闻图片'}
                        caption={item.caption}
                    />
                );
            case 'imageGroup':
                return (
                    <ImageGroup
                        key={index}
                        images={item.images!}
                        caption={item.caption}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <div className="text-gray-500 mb-8 text-lg">
                <span>{date}</span> | <span>{author}</span>
            </div>
            {content.map(renderContent)}
        </div>
    );
};

export default NewsPreview;