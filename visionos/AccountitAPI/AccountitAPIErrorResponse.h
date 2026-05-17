#import <Foundation/Foundation.h>
#import <AccountitAPI/AccountitAPIDTO.h>

NS_ASSUME_NONNULL_BEGIN

FOUNDATION_EXPORT NSString * const AccountitAPIErrorDomain;
FOUNDATION_EXPORT NSString * const AccountitAPIErrorResponseKey;
FOUNDATION_EXPORT NSString * const AccountitAPIHTTPStatusCodeKey;

@interface AccountitAPIErrorDetail : AccountitAPIDTO
@property (nonatomic, copy, readonly, nullable) NSString *field;
@property (nonatomic, copy, readonly, nullable) NSString *message;
@end

@interface AccountitAPIErrorResponse : AccountitAPIDTO
@property (nonatomic, assign, readonly) NSInteger statusCode;
@property (nonatomic, copy, readonly, nullable) NSString *errorCode;
@property (nonatomic, copy, readonly, nullable) NSString *message;
@property (nonatomic, copy, readonly, nullable) NSString *path;
@property (nonatomic, copy, readonly, nullable) NSString *timestamp;
@property (nonatomic, copy, readonly) NSArray<AccountitAPIErrorDetail *> *details;
@end

NS_ASSUME_NONNULL_END
