/*
Implement utility function to track drivezy analytics events across all platform
'analytics','segemnts'
*/

import ENV from './env.constant';


let defautlHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
};

var Analytics = undefined;


var appAnalytics;
var webAnalytics;
var socket;

/**
 * Utility method for all analytic events
 */
export default class DrivezyAnalytics{
    
    /**
     * initialize all events
     * @param {object} isSegement
     * @param {boolean} isDrivezyAnalytics
     * @param {boolean} isApp
     */
    static async initialize(isSegement, isDrivezyAnalytics, isApp, appType){
        defautlHeaders
        if(isApp){
            if(isSegement.enable){
                if(!isSegement.key){
                    console.log('Please setup your segment key')
                    return;
                }else{
                    import('analytics-react-native').then((Analytics) => {
                        if(Analytics == undefined){
                            console.log('analytics-react-native library is not imported.')
                            return;
                        }else{
                            appAnalytics = new Analytics(isSegement.key);
                        }
                    })
                }
            }
        }else{
            if(isSegement.enable){
                if(!isSegement.key){
                    console.log('Please setup your segment key')
                    return;
                }else{
                    // exectues only if prod env
                    !function () {
                        analytics = window.analytics = window.analytics || []; if (!analytics.initialize) if (analytics.invoked) window.console && console.error && console.error("Segment snippet included twice."); else {
                            analytics.invoked = !0; analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "reset", "group", "track", "ready", "alias", "debug", "page", "once", "off", "on"]; analytics.factory = function (t) { return function () { var e = Array.prototype.slice.call(arguments); e.unshift(t); analytics.push(e); return analytics } }; for (var t = 0; t < analytics.methods.length; t++) { var e = analytics.methods[t]; analytics[e] = analytics.factory(e) } analytics.load = function (t) { var e = document.createElement("script"); e.type = "text/javascript"; e.async = !0; e.src = ("https:" === document.location.protocol ? "https://" : "http://") + "cdn.segment.com/analytics.js/v1/" + t + "/analytics.min.js"; var n = document.getElementsByTagName("script")[0]; n.parentNode.insertBefore(e, n) }; analytics.SNIPPET_VERSION = "4.0.0";
                            analytics.load(ENV.SEGMENT_KEYS.WEB);
                            analytics.page();
                        }
                    }();
                }
            }
            if(isDrivezyAnalytics){            
                socket = io(ENV.SOCKET_URL);
                socket.on("connect", function() {});
            }
        }
    }

    /**
     * identify user event
     * @param {object} isSegement
     * @param {boolean} isDrivezyAnalytics
     * @param {boolean} isApp
     * @param {object} user
     */
    static async identifyUser(isSegement, isDrivezyAnalytics, isApp, user){
        if(isApp){
            if(isSegement.enable){
                if(!isSegement.key){
                    console.log('Please setup your segment key')
                    return;
                }else{
                    if (user.mobile) {
                        var phone = '+91' + user.mobile.toString();
                    }
                    try {
                        appAnalytics.identify({
                            userId: user.id,
                            traits: {
                                name: user.display_name,
                                mobile: user.mobile,
                                email: user.email,
                                phone: phone,
                                last_login: new Date()
                            }
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
            else{
                return;
            }
        }else{
            if(!isSegement.enable){
                if(isSegement.key){
                    console.log('Please setup your segment key')
                    return;
                }else{
                    if(user.mobile){
                        var phone = '+91' + user.mobile.toString();
                    }
                    try{
                        analytics.identify(user.id, {
                            name: user.display_name,
                            mobile: user.mobile,
                            email: user.email,
                            phone: phone
                        });
                    }catch(e){
                        console.log(e);
                    }
                }
            }
            else{
                return;
            }
        }
    }

    /**
     * analytic track event
     * @param {object} isSegement
     * @param {boolean} isDrivezyAnalytics
     * @param {boolean} isApp
     * @param {number} userId
     * @param {string} event
     * @param {object} eventObject
     * @param {object} headers
     * @param {body} body}
     */
    static async trackEvent (isSegement, isDrivezyAnalytics, isApp, userId, event, eventObject, headers, body){
        if(isApp){
            if(isSegement.enable){
                if(!isSegement.key){
                    console.log('Please setup your segment key')
                    return;
                }else{
                    appAnalytics.track({
                        userId: userId,
                        event: event,
                        properties: eventObject
                    });
                }
            }
            if(isDrivezyAnalytics){
                var url = ENV.API_URL;
                var method = 'POST';
                var headers = headers || defautlHeaders;
                var params = {
                    event_name: event,
                    event_data : eventObject
                };
                return fetch(url, { headers, body, method, params, credentials: 'include' })
                .then((response) => response.json())
                .then((response) => {
                    return response;
                })
                .catch((error) => {
                    return error;
                });
            }
        }else{
            if(isSegement.enable){
                if(!isSegement.key){
                    console.log('Please setup your segment key')
                    return;
                }else{
                    try{
                        analytics.track(event, eventObject);
                    }catch(e){
                        console.log(e);
                    }
                }
            }
            if(isDrivezyAnalytics){
                if(socket.connected){
                    var params = {
                        event_name: event,
                        event_data : eventObject
                    };
                    socket.emit("ua-request", params);
                }else{
                    var url = ENV.API_URL;
                    var method = 'POST';
                    var headers = headers || defautlHeaders;
                    var params = {
                        event_name: event,
                        event_data : eventObject
                    };
                    return fetch(url, { headers, body, method, params, credentials: 'include' })
                    .then((response) => response.json())
                    .then((response) => {
                        return response;
                    })
                    .catch((error) => {
                        return error;
                    });
                }
            }
        }

    }

}