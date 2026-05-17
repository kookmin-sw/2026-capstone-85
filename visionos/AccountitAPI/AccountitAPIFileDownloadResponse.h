#import <Foundation/Foundation.h>
#import <AccountitAPI/AccountitAPIDTO.h>

NS_ASSUME_NONNULL_BEGIN

@interface AccountitAPIFileDownloadResponse : AccountitAPIDTO
@property (nonatomic, copy, readonly) NSData *data;
@property (nonatomic, copy, readonly, nullable) NSString *contentType;
@property (nonatomic, copy, readonly, nullable) NSString *suggestedFilename;
- (instancetype)initWithData:(NSData *)data response:(nullable NSURLResponse *)response;
@end

NS_ASSUME_NONNULL_END
