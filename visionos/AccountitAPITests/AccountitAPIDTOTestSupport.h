#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>

NS_ASSUME_NONNULL_BEGIN

@interface AccountitAPIDTOTestSupport : NSObject

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

+ (void)assertCopyingAndSecureCodingRoundTripForDTOClass:(Class)DTOClass;

@end

NS_ASSUME_NONNULL_END
